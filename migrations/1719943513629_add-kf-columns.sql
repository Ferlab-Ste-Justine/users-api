-- Up Migration
ALTER TABLE users 
    ADD COLUMN newsletter_dataset_subscription_status TEXT;
ALTER TABLE users 
    ADD COLUMN location_country CITEXT;
ALTER TABLE users 
    ADD COLUMN location_state CITEXT;
ALTER TABLE users 
    ADD COLUMN website TEXT;
ALTER TABLE users
    ADD COLUMN areas_of_interest CITEXT[];
ALTER TABLE users 
    ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;
UPDATE users SET is_public = true;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN newsletter_dataset_subscription_status;
ALTER TABLE users 
    DROP COLUMN location_country;
ALTER TABLE users 
    DROP COLUMN location_state;
ALTER TABLE users 
    DROP COLUMN website;
ALTER TABLE users
    DROP COLUMN areas_of_interest;
ALTER TABLE users 
    DROP COLUMN is_public;
