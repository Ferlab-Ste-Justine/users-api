-- Up Migration
ALTER TABLE users DROP COLUMN nih_ned_id;

-- Down Migration
ALTER TABLE users ADD COLUMN nih_ned_id VARCHAR(255);
