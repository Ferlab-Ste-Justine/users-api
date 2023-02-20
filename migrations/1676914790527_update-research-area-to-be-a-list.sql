-- Up Migration
ALTER TABLE users
    ADD COLUMN research_areas TEXT[];

ALTER TABLE users
    RENAME COLUMN research_area TO research_area_description;

-- Down Migration
ALTER TABLE users
    DROP COLUMN research_areas TEXT[];

ALTER TABLE users
    RENAME COLUMN research_area_description TO research_area;