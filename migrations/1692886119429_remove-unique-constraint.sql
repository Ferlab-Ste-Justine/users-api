-- Up Migration
drop index idx_unique_saved_filters;

drop function get_filter_uniqueness_date();
-- Down Migration
CREATE OR REPLACE FUNCTION get_filter_uniqueness_date() RETURNS timestamp AS $$
declare run_on_date timestamp;
BEGIN
    SELECT run_on into run_on_date
    FROM pgmigrations
    WHERE name = '1688561786592_update-saved-filter';

    RETURN run_on_date;
END
$$ LANGUAGE plpgsql
    IMMUTABLE;;

CREATE UNIQUE INDEX idx_unique_saved_filters
    ON saved_filters (title, keycloak_id, type)
    WHERE creation_date > get_filter_uniqueness_date();