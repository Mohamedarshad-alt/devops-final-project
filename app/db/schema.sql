CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO items (name, description)
SELECT 'DevOps Pipeline', 'Automated build, test, scan and deployment'
WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE name = 'DevOps Pipeline'
);

INSERT INTO items (name, description)
SELECT 'Monitoring Dashboard', 'Application and infrastructure monitoring'
WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE name = 'Monitoring Dashboard'
);
