import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 1212;

export const keycloakURL = process.env.KEYCLOAK_URL;
export const keycloakRealm = process.env.KEYCLOAK_REALM;
export const keycloakClient = process.env.KEYCLOAK_CLIENT;

export const dbHost = process.env.PGHOST;
export const dbPort: number = Number.parseInt(process.env.PGPORT);
export const dbName = process.env.PGDATABASE;
export const dbUser = process.env.PGUSER;
export const dbPassword = process.env.PGPASSWORD;

export const adminRoleName = process.env.ADMIN_ROLE_NAME || 'admin';
