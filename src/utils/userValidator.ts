import Realm from '../config/realm';
import { IUserInput } from '../db/models/User';

export interface UserValidator {
    (payload: IUserInput): boolean;
}

const includeUserValidator = (payload: IUserInput): boolean =>
    (payload.era_commons_id ||
        payload.nih_ned_id ||
        (payload.external_individual_fullname && payload.external_individual_email)) &&
    payload.roles?.length &&
    payload.portal_usages?.length > 0;

const cqdgUserValidator = (payload: IUserInput): boolean =>
    payload.roles?.length && payload.research_domains?.length > 0;

const defaultUserValidator = (_payload: IUserInput) => true; // no additionnal validation

export const getUserValidator = (realm: string): UserValidator => {
    switch (realm) {
        case Realm.INCLUDE:
            return includeUserValidator;
        case Realm.CQDG:
            return cqdgUserValidator;
        default:
            return defaultUserValidator;
    }
};
