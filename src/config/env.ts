import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 1212;

export const keycloakURL = process.env.KEYCLOAK_URL;
export const keycloakRealm = process.env.KEYCLOAK_REALM;
export const keycloakClient = process.env.KEYCLOAK_CLIENT;

export const profileImageBucket = process.env.PROFILE_IMAGE_BUCKET;

export const dbHost = process.env.DATABASE_HOST;
export const dbPort: number = Number.parseInt(process.env.DATABASE_PORT);
export const dbName = process.env.DATABASE_NAME;
export const dbUser = process.env.DATABASE_USER;
export const dbPassword = process.env.DATABASE_PASSWORD;

export const adminRoleName = process.env.ADMIN_ROLE_NAME || 'admin';

export const smartsheetId = process.env.SMARTSHEET_ID;
export const smartsheetToken = process.env.SMARTSHEET_TOKEN;

export const personaURL = process.env.PERSONA_URL || 'not supported';

export const mailchimpApiKey = process.env.MAILCHIMP_API_KEY || '';
export const mailchimpUsername = process.env.MAILCHIMP_USERNAME || '';
export const mailchimpKidsfirstListId = process.env.MAILCHIMP_KF_LIST_ID || '';
//@deprecated (newsletter_dataset_subcription)
export const mailchimpKidsfirstDatasetListId = process.env.MAILCHIMP_KF_DATASET_LIST_ID || '';
