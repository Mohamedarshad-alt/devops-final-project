const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../src/app');

test('GET /health returns healthy when database responds', async () => {
  const pool = {
    query: async () => ({ rows: [{ '?column?': 1 }] })
  };

  const app = createApp(pool);
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'healthy');
  assert.equal(response.body.database, 'connected');
});

test('GET /health returns 503 when database is unavailable', async () => {
  const pool = {
    query: async () => {
      throw new Error('Database connection failed');
    }
  };

  const app = createApp(pool);
  const response = await request(app).get('/health');

  assert.equal(response.status, 503);
  assert.equal(response.body.status, 'unhealthy');
});

test('GET /api/v1/items returns database records', async () => {
  const pool = {
    query: async () => ({
      rows: [
        {
          id: 1,
          name: 'DevOps Pipeline',
          description: 'Automated deployment',
          completed: false
        }
      ]
    })
  };

  const app = createApp(pool);
  const response = await request(app).get('/api/v1/items');

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 1);
  assert.equal(response.body.items[0].name, 'DevOps Pipeline');
  assert.equal(response.body.items[0].completed, false);
});

test('POST /api/v1/items creates a task', async () => {
  const pool = {
    query: async (sql, values) => ({
      rows: [{
        id: 3,
        name: values[0],
        description: values[1],
        completed: false,
        created_at: new Date().toISOString()
      }]
    })
  };

  const app = createApp(pool);

  const response = await request(app)
    .post('/api/v1/items')
    .send({
      name: 'Learn React',
      description: 'Build the To-Do frontend'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.item.name, 'Learn React');
  assert.equal(response.body.item.completed, false);
});

test('POST rejects an empty task name', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .post('/api/v1/items')
    .send({ name: '   ' });

  assert.equal(response.status, 400);
});

test('POST rejects a task name longer than 150 characters', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .post('/api/v1/items')
    .send({ name: 'A'.repeat(151) });

  assert.equal(response.status, 400);
});

test('POST rejects a non-string description', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .post('/api/v1/items')
    .send({ name: 'Test task', description: 123 });

  assert.equal(response.status, 400);
});

test('PATCH updates a task', async () => {
  const pool = {
    query: async (sql, values) => ({
      rows: [{
        id: values[1],
        name: values[0],
        description: 'Updated description',
        completed: true
      }]
    })
  };

  const app = createApp(pool);

  const response = await request(app)
    .patch('/api/v1/items/1')
    .send({
      name: 'Updated task',
      completed: true
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.item.name, 'Updated task');
  assert.equal(response.body.item.completed, true);
});

test('PATCH rejects an invalid task ID', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .patch('/api/v1/items/abc')
    .send({ completed: true });

  assert.equal(response.status, 400);
});

test('PATCH rejects an empty update', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .patch('/api/v1/items/1')
    .send({});

  assert.equal(response.status, 400);
});

test('PATCH rejects a non-boolean completed value', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .patch('/api/v1/items/1')
    .send({ completed: 'yes' });

  assert.equal(response.status, 400);
});

test('PATCH returns 404 when task does not exist', async () => {
  const pool = {
    query: async () => ({ rows: [] })
  };

  const app = createApp(pool);

  const response = await request(app)
    .patch('/api/v1/items/999')
    .send({ completed: true });

  assert.equal(response.status, 404);
});

test('DELETE removes a task', async () => {
  const pool = {
    query: async () => ({
      rows: [{ id: 1 }]
    })
  };

  const app = createApp(pool);

  const response = await request(app)
    .delete('/api/v1/items/1');

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Task deleted successfully');
  assert.equal(response.body.id, 1);
});

test('DELETE rejects an invalid task ID', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app)
    .delete('/api/v1/items/abc');

  assert.equal(response.status, 400);
});

test('DELETE returns 404 when task does not exist', async () => {
  const pool = {
    query: async () => ({ rows: [] })
  };

  const app = createApp(pool);

  const response = await request(app)
    .delete('/api/v1/items/999');

  assert.equal(response.status, 404);
});

test('Unknown routes return 404', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app).get('/does-not-exist');

  assert.equal(response.status, 404);
});

test('GET /metrics exposes Prometheus metrics', async () => {
  const pool = {
    query: async () => ({ rows: [{ '?column?': 1 }] })
  };

  const app = createApp(pool);

  await request(app).get('/health');

  const response = await request(app).get('/metrics');

  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /text\/plain/);
  assert.match(response.text, /http_requests_total/);
  assert.match(response.text, /http_request_duration_seconds/);
  assert.match(response.text, /process_resident_memory_bytes/);
});
