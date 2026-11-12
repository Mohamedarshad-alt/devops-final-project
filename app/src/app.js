const express = require('express');
const client = require('@prometheus-io/client');

function createApp(pool) {
  const app = express();
  const register = new client.Registry();

  client.collectDefaultMetrics({ register });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests handled by the API.',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds.',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register]
  });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // Collect HTTP metrics, excluding Prometheus scrapes.
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      if (req.path === '/metrics') return;

      const route = req.route?.path
        ? `${req.baseUrl || ''}${req.route.path}`
        : 'unmatched';

      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode)
      };

      const duration =
        Number(process.hrtime.bigint() - start) / 1e9;

      httpRequestsTotal.inc(labels);
      httpRequestDuration.observe(labels, duration);
    });

    next();
  });

  // Prometheus metrics
  app.get('/metrics', async (req, res, next) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      next(error);
    }
  });

  // Health check
  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');

      res.status(200).json({
        status: 'healthy',
        database: 'connected'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        database: 'unavailable'
      });
    }
  });

  // READ: Get all tasks
  app.get('/api/v1/items', async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, name, description, completed, created_at
         FROM items
         ORDER BY id`
      );

      res.status(200).json({
        count: result.rows.length,
        items: result.rows
      });
    } catch (error) {
      next(error);
    }
  });

  // CREATE: Add a new task
  app.post('/api/v1/items', async (req, res, next) => {
    try {
      const { name, description = '' } = req.body || {};

      if (
        typeof name !== 'string' ||
        name.trim().length === 0 ||
        name.trim().length > 150
      ) {
        return res.status(400).json({
          error: 'Name is required and must be between 1 and 150 characters.'
        });
      }

      if (typeof description !== 'string') {
        return res.status(400).json({
          error: 'Description must be a string.'
        });
      }

      const result = await pool.query(
        `INSERT INTO items (name, description)
         VALUES ($1, $2)
         RETURNING id, name, description, completed, created_at`,
        [name.trim(), description.trim()]
      );

      res.status(201).json({
        message: 'Task created successfully',
        item: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  });

  // UPDATE: Edit a task or change its completion status
  app.patch('/api/v1/items/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body || {};

      if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
          error: 'Invalid task ID.'
        });
      }

      const allowedFields = ['name', 'description', 'completed'];
      const fields = Object.keys(body);

      if (
        fields.length === 0 ||
        fields.some(field => !allowedFields.includes(field))
      ) {
        return res.status(400).json({
          error: 'Provide at least one valid field: name, description, completed.'
        });
      }

      if (
        Object.hasOwn(body, 'name') &&
        (
          typeof body.name !== 'string' ||
          body.name.trim().length === 0 ||
          body.name.trim().length > 150
        )
      ) {
        return res.status(400).json({
          error: 'Name must be between 1 and 150 characters.'
        });
      }

      if (
        Object.hasOwn(body, 'description') &&
        typeof body.description !== 'string'
      ) {
        return res.status(400).json({
          error: 'Description must be a string.'
        });
      }

      if (
        Object.hasOwn(body, 'completed') &&
        typeof body.completed !== 'boolean'
      ) {
        return res.status(400).json({
          error: 'Completed must be true or false.'
        });
      }

      const columnMap = {
        name: 'name',
        description: 'description',
        completed: 'completed'
      };

      const values = [];
      const assignments = [];

      for (const field of fields) {
        let value = body[field];

        if (field === 'name' || field === 'description') {
          value = value.trim();
        }

        values.push(value);
        assignments.push(
          `${columnMap[field]} = $${values.length}`
        );
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE items
         SET ${assignments.join(', ')}
         WHERE id = $${values.length}
         RETURNING id, name, description, completed, created_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Task not found.'
        });
      }

      res.status(200).json({
        message: 'Task updated successfully',
        item: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  });

  // DELETE: Remove a task
  app.delete('/api/v1/items/:id', async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
          error: 'Invalid task ID.'
        });
      }

      const result = await pool.query(
        'DELETE FROM items WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Task not found.'
        });
      }

      res.status(200).json({
        message: 'Task deleted successfully',
        id: result.rows[0].id
      });
    } catch (error) {
      next(error);
    }
  });

  // Unknown routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });

  // Central error handler
  app.use((error, req, res, next) => {
    console.error('Request failed:', error.message);

    if (res.headersSent) {
      return next(error);
    }

    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: 'Invalid JSON request body.'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return app;
}

module.exports = { createApp };
