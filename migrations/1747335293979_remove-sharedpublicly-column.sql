-- Up Migration
ALTER TABLE user_sets DROP COLUMN sharedpublicly;

-- Down Migration
ALTER TABLE user_sets ADD COLUMN sharedPublicly BOOLEAN  NOT NULL DEFAULT false;