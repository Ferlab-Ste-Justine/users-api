import { IUserInput } from '../db/models/User';
import Realm from './realm';

export interface UserValidator {
    (payload: IUserInput): boolean;
}

const includeUserValidator = (payload: IUserInput) =>
    (payload.era_commons_id ||
        payload.nih_ned_id ||
        (payload.external_individual_fullname && payload.external_individual_email)) &&
    payload.roles &&
    payload.roles.length > 0 &&
    payload.portal_usages &&
    payload.portal_usages.length > 0;

const cqdgUserValidator = (payload: IUserInput) =>
    payload.roles && payload.roles.length > 0 && payload.research_areas && payload.research_areas.length > 0;

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
