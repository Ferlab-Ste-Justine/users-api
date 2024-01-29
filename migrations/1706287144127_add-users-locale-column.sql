-- Up Migration
ALTER TABLE users 
    ADD COLUMN locale TEXT;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN locale;
