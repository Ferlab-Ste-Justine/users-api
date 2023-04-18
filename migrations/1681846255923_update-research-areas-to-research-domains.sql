-- Up Migration
ALTER TABLE users
    RENAME COLUMN research_areas TO research_domains;
ALTER TABLE users
    ALTER COLUMN research_domains TYPE citext[];

-- Down Migration
ALTER TABLE users
    RENAME COLUMN research_domains TO research_areas;
ALTER TABLE users
    ALTER COLUMN research_domains TYPE text[];
