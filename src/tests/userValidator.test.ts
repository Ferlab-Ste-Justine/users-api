import Realm from '../config/realm';
import { IUserInput } from '../db/models/User';
import { getUserValidator } from '../utils/userValidator';

describe('User Validator', () => {
    describe('getUserValidator', () => {
        const inputUser: IUserInput = {
            id: 123,
            keycloak_id: 'keycloak_id',
            creation_date: new Date(),
            updated_date: new Date(),
            accepted_terms: false,
            understand_disclaimer: false,
            completed_registration: false,
            deleted: false,
        };

        it('should validate using Include validator if realm = includedcc', () => {
            const validIncludeInputUser = {
                ...inputUser,
                roles: ['role_1'],
                era_commons_id: 'era_commons_id',
                portal_usages: ['usage_1'],
            };

            expect(getUserValidator(Realm.INCLUDE)(validIncludeInputUser)).toBeTruthy();

            const invalidIncludeInputUser = {
                ...inputUser,
                roles: ['role_1'],
                research_domains: ['research_domains_1'],
            };

            expect(getUserValidator(Realm.INCLUDE)(invalidIncludeInputUser)).toBeFalsy();
        });

        it('should validate using CQDG validator if realm = CQDG', () => {
            const validCqdgInputUser = {
                ...inputUser,
                roles: ['role_1'],
                research_domains: ['research_domains_1'],
            };

            expect(getUserValidator(Realm.CQDG)(validCqdgInputUser)).toBeTruthy();

            const invalidCqdgInputUser = {
                ...inputUser,
                roles: ['role_1'],
                era_commons_id: 'era_commons_id',
                portal_usages: ['usage_1'],
            };

            expect(getUserValidator(Realm.CQDG)(invalidCqdgInputUser)).toBeFalsy();
        });

        it('should not do extra validation in other cases', () => {
            expect(getUserValidator('other')(inputUser)).toBeTruthy();
        });
    });

    describe('includeUserValidator', () => {
        it('should return true if roles and portal_usages and an id are not empty', () => {
            const inputUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                creation_date: new Date(),
                updated_date: new Date(),
                accepted_terms: false,
                understand_disclaimer: false,
                completed_registration: false,
                roles: ['role_1'],
                portal_usages: ['usage_1'],
                deleted: false,
            };

            const userWithEraCommonsId = { ...inputUser, era_commons_id: 'era_commons_id' };
            const userWithExternalIds = {
                ...inputUser,
                external_individual_fullname: 'external_individual_fullname',
                external_individual_email: 'external_individual_email',
            };

            expect(getUserValidator(Realm.INCLUDE)(userWithEraCommonsId)).toBeTruthy();
            expect(getUserValidator(Realm.INCLUDE)(userWithExternalIds)).toBeTruthy();
        });

        it('should return false otherwise', () => {
            const inputUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                creation_date: new Date(),
                updated_date: new Date(),
                accepted_terms: false,
                understand_disclaimer: false,
                completed_registration: false,
                deleted: false,
            };

            const inputUserWithoutId = {
                ...inputUser,
                roles: ['role_1'],
                portal_usages: ['usage_1'],
            };

            const inputUserWithIncompleteExternalIdMissingEmail = {
                ...inputUser,
                roles: ['role_1'],
                portal_usages: ['usage_1'],
                external_individual_fullname: 'external_individual_fullname',
            };
            const inputUserWithIncompleteExternalIdMissingFullname = {
                ...inputUser,
                roles: ['role_1'],
                portal_usages: ['usage_1'],
                external_individual_email: 'external_individual_email',
            };

            const inputUserWithEmptyRole = {
                ...inputUser,
                roles: [],
                portal_usages: ['usage_1'],
            };

            const inputUserWithNullRole = {
                ...inputUser,
                roles: null,
                portal_usages: ['usage_1'],
            };

            const inputUserWithEmptyPortalUsage = {
                ...inputUser,
                roles: ['role_1'],
                portal_usages: [],
            };

            const inputUserWithNullPortalUsage = {
                ...inputUser,
                roles: ['role_1'],
                portal_usages: null,
            };

            expect(getUserValidator(Realm.INCLUDE)(inputUser)).toBeFalsy(); // all are undefined
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithoutId)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithIncompleteExternalIdMissingEmail)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithIncompleteExternalIdMissingFullname)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithEmptyRole)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithNullRole)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithEmptyPortalUsage)).toBeFalsy();
            expect(getUserValidator(Realm.INCLUDE)(inputUserWithNullPortalUsage)).toBeFalsy();
        });
    });

    describe('cqdgUserValidator', () => {
        it('should return true if roles and research_domains are not empty', () => {
            const validInputUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                creation_date: new Date(),
                updated_date: new Date(),
                accepted_terms: false,
                understand_disclaimer: false,
                completed_registration: false,
                roles: ['role_1'],
                research_domains: ['research_domains_1'],
                deleted: false,
            };

            expect(getUserValidator(Realm.CQDG)(validInputUser)).toBeTruthy();
        });

        it('should return false otherwise', () => {
            const inputUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                creation_date: new Date(),
                updated_date: new Date(),
                accepted_terms: false,
                understand_disclaimer: false,
                completed_registration: false,
                deleted: false,
            };

            const inputUserWithEmptyList = {
                ...inputUser,
                roles: [],
                research_domains: [],
            };

            const inputUserWithNull = {
                ...inputUser,
                roles: null,
                research_domains: null,
            };

            const inputUserWithOnlyRoles = {
                ...inputUser,
                roles: ['role_1'],
                research_domains: [],
            };

            const inputUserWithOnlyResearchDomains = {
                ...inputUser,
                roles: [],
                research_domains: ['research_domains_1'],
            };

            expect(getUserValidator(Realm.CQDG)(inputUser)).toBeFalsy(); // both are undefined
            expect(getUserValidator(Realm.CQDG)(inputUserWithEmptyList)).toBeFalsy();
            expect(getUserValidator(Realm.CQDG)(inputUserWithNull)).toBeFalsy();
            expect(getUserValidator(Realm.CQDG)(inputUserWithOnlyRoles)).toBeFalsy();
            expect(getUserValidator(Realm.CQDG)(inputUserWithOnlyResearchDomains)).toBeFalsy();
        });
    });
});
