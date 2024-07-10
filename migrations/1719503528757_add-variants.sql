-- Up Migration
CREATE TABLE variants (
    id SERIAL NOT NULL,
    unique_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::JSONB
);
ALTER TABLE variants ADD PRIMARY KEY (id);

-- Down Migration
DROP TABLE variants;