const express = require('express');

function createApp(pool) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

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
