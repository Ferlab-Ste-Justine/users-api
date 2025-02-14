-- Up Migration
ALTER TABLE user_sets
    ADD COLUMN is_invisible BOOLEAN NOT NULL DEFAULT false

-- Down Migration
ALTER TABLE user_sets
DROP COLUMN is_invisible