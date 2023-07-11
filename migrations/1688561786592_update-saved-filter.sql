-- Up Migration
CREATE TYPE filter_types AS ENUM ('query', 'filter');
ALTER TABLE saved_filters
   ADD COLUMN type filter_types NOT NULL DEFAULT 'filter';

-- Down Migration
ALTER TABLE saved_filters
   DROP COLUMN type;
DROP TYPE filter_types;
