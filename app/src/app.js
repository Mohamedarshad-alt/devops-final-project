
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

  // Collect request metrics without counting Prometheus scrapes.
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      if (req.path === '/metrics') {
        return;
      }

      // Use route templates rather than arbitrary URLs to avoid
      // creating an excessive number of metric label values.
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

  app.get('/metrics', async (req, res, next) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      next(error);
    }
  });

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

  app.get('/api/v1/items', async (req, res, next) => {
    try {
      const result = await pool.query(
        'SELECT id, name, description FROM items ORDER BY id'
      );

      res.status(200).json({
        count: result.rows.length,
        items: result.rows
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });

  app.use((error, req, res, next) => {
    console.error('Request failed:', error.message);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return app;
}

module.exports = { createApp };
