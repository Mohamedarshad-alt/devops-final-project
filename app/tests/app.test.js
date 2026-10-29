const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../src/app");

test("GET /health returns healthy when database responds", async () => {
  const pool = {
    query: async () => ({ rows: [{ "?column?": 1 }] })
  };

  const app = createApp(pool);

  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "healthy");
  assert.equal(response.body.database, "connected");
});

test("GET /health returns 503 when database is unavailable", async () => {
  const pool = {
    query: async () => {
      throw new Error("Database connection failed");
    }
  };

  const app = createApp(pool);

  const response = await request(app).get("/health");

  assert.equal(response.status, 503);
  assert.equal(response.body.status, "unhealthy");
});

test("GET /api/v1/items returns database records", async () => {
  const pool = {
    query: async () => ({
      rows: [
        {
          id: 1,
          name: "DevOps Pipeline",
          description: "Automated deployment"
        }
      ]
    })
  };

  const app = createApp(pool);

  const response = await request(app).get("/api/v1/items");

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 1);
  assert.equal(response.body.items[0].name, "DevOps Pipeline");
});

test("unknown routes return 404", async () => {
  const pool = { query: async () => ({ rows: [] }) };
  const app = createApp(pool);

  const response = await request(app).get("/does-not-exist");

  assert.equal(response.status, 404);
});
