/*
 * INCLUDE - CODEBASE SWITCHING
 * This script is meant to be used for INCLUDE only.
 * It needs to run once in each desired env (QA, PRD),
 * Afterwards, it can be deleted.
 *
 * The script shapes the pgmigrations table to match this codebase.
 * For, INCLUDE was using this codebase:
 *  https://github.com/include-dcc/include-users-api/tree/68d257abb5aca95cfa40b92adaf603070b3657e7
 * and now is using this very one.
 * */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const INCLUDE_REALM = 'includedcc';
const keycloakRealm = process.env.KEYCLOAK_REALM;
if (keycloakRealm !== INCLUDE_REALM) {
    process.exit(0);
}

const clientConfWithoutPassword = {
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
};
console.log('Client base config: ', clientConfWithoutPassword);

const client = new pg.Client({
    ...clientConfWithoutPassword,
    password: process.env.DATABASE_PASSWORD,
});

console.log('Awaiting database connection...');
await client.connect();

try {
    const sQuery = `
    UPDATE pgmigrations
SET name = '1681483611303_add-linkedin-field'
where name = '1658554082950_add-linkedin-field';
UPDATE pgmigrations
SET name = '1681483665903_add-public-email-to-user'
where name = '1658792699026_add-public-email-to-user';
UPDATE pgmigrations
SET name = '1681484119395_add-deleted-flag'
where name = '1659082810530_add-deleted-flag';
UPDATE pgmigrations
SET name = '1681484262585_ci-roles-and-usages'
where name = '1662512614645_ci-roles-and-usages';
UPDATE pgmigrations
SET name = '1681484310927_update-firstname-lastname-and-affialiation-citext'
where name = '1662602104596_update-firstname-lastname-and-affialiation-citext';
UPDATE pgmigrations
SET name = '1681484357035_profile-image-key'
where name = '1663204757289_profile-image-key';


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS research_areas TEXT[];


DO
$$
    BEGIN
        IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'users' and column_name = 'research_area')
            AND
           NOT EXISTS(SELECT *
                      FROM information_schema.columns
                      WHERE table_name = 'users'
                        and column_name = 'research_area_description')
        THEN
            ALTER TABLE users
                RENAME COLUMN research_area TO research_area_description;
        END IF;
    END
$$;



INSERT INTO pgmigrations (name, run_on)
SELECT '1676914790527_update-research-area-to-be-a-list', '2022-09-16 20:00:00.000001'::timestamp without time zone
WHERE NOT EXISTS (SELECT 1 FROM pgmigrations WHERE name = '1676914790527_update-research-area-to-be-a-list');
    `;
    console.log('Performing query...');
    await client.query(sQuery);
    console.log('Done!');
} catch (err) {
    console.error(err);
} finally {
    console.log('Ending.');
    await client.end();
}
