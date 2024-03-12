-- Up Migration
ALTER TABLE users 
    ADD COLUMN newsletter_email TEXT;
    ADD COLUMN newsletter_subscription_status TEXT;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN newsletter_email;
    DROP COLUMN newsletter_subscription_status;
