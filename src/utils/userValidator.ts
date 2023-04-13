import { IUserInput } from '../db/models/User';

export const validateUserRegistrationPayload = (payload: IUserInput) =>
    (payload.era_commons_id ||
        payload.nih_ned_id ||
        (payload.external_individual_fullname && payload.external_individual_email)) &&
    payload.roles.length > 0 &&
    payload.portal_usages.length > 0;