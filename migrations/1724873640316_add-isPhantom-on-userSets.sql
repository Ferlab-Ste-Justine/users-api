-- Up Migration
ALTER TABLE user_sets
    ADD COLUMN isPhantomManifest BOOLEAN NOT NULL DEFAULT false

-- Down Migration
ALTER TABLE user_sets
    DROP COLUMN isPhantomManifest
