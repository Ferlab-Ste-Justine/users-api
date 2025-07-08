-- Up Migration
UPDATE users
SET newsletter_subscription_status = 'subscribed'
WHERE newsletter_dataset_subscription_status = 'subscribed';