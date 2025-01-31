-- Up Migration
ALTER TABLE users
    ADD COLUMN title TEXT;

-- Down Migration
ALTER TABLE users
DROP COLUMN title;
