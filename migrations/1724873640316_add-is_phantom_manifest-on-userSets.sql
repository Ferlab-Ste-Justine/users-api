-- Up Migration
ALTER TABLE user_sets
    ADD COLUMN is_phantom_manifest BOOLEAN NOT NULL DEFAULT false

-- Down Migration
ALTER TABLE user_sets
    DROP COLUMN is_phantom_manifest
