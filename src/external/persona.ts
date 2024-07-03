/* eslint-disable no-console */
import { parseString } from '@fast-csv/parse';

import { personaURL } from '../config/env';
import UserModel from '../db/models/User';
import { LINKEDIN_REGEX } from '../utils/constants';
import { SubscriptionStatus } from '../utils/newsletter';

export type Persona = {
    id: string;
    isPublic: boolean;
    isActive: boolean;
    title: string;
    firstName: string;
    lastName: string;
    role: string[];
    loginEmail: string;
    institution: string;
    department: string;
    jobTitle: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    institutionalEmail: string;
    eraCommonsID: string;
    website: string;
    twitter: string;
    orchid: string;
    linkedin: string;
    googleScholarId: string;
    github: string;
    facebook: string;
    acceptedTerms: boolean;
    acceptedNihOptIn: boolean;
    acceptedKfOptIn: boolean;
    acceptedDatasetSub: boolean;
    interests: string[];
    egoId: string;
    story: string;
    bio: string;
};

export const validateUniqPersonas = (personas: Persona[]): boolean => {
    const result = new Map();
    personas.reduce((map, obj) => {
        if (map.has(obj.egoId)) {
            map.set(obj.egoId, map.get(obj.egoId).push(obj));
        } else {
            map.set(obj.egoId, [obj]);
        }
        return map;
    }, result);
    const values = Array.from(result.values()).filter((l) => l.length !== 1);
    if (values.length > 0) {
        console.warn('OOPS duplicate persona');
        return false;
    }
    return true;
};

export const readCsv = (csvContent: string): Promise<Persona[]> =>
    new Promise((resolve, reject) => {
        const data = [];

        parseString(csvContent, { headers: true })
            .on('error', reject)
            .on('data', (row) => {
                const obj = convertEmptyToNull(row);
                if (obj) data.push(obj);
            })
            .on('end', () => {
                resolve(data);
            });
    });

export const getUserList = async (accessToken: string): Promise<string> => {
    const uri = `${personaURL}/userlist`;

    const response = await fetch(encodeURI(uri), {
        method: 'get',
        headers: {
            Authorization: accessToken,
            'Content-Type': 'text/csv',
        },
    });

    const body = await response.text();

    if (response.status === 200) {
        return body;
    }

    throw new Error(`Error during call to Persona with status [${response.status}]`);
};

export const convertEmptyToNull = (p: any): Persona => ({
    id: p.id,
    isPublic: p.isPublic === 'true',
    isActive: p.isActive === 'true',
    title: p.title,
    firstName: p.firstName === '' ? null : p.firstName,
    lastName: p.lastName === '' ? null : p.lastName,
    role: p.role === '' ? [] : p.role.split(','),
    loginEmail: p.loginEmail === '' ? null : p.loginEmail,
    institution: p.institution === '' ? null : p.institution,
    department: p.department,
    jobTitle: p.jobTitle,
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2,
    city: p.city,
    state: p.state === '' ? null : p.state,
    country: p.country === '' ? null : p.country,
    phone: p.phone,
    institutionalEmail: p.institutionalEmail === '' ? null : p.institutionalEmail,
    eraCommonsID: p.eraCommonsID === '' ? null : p.eraCommonsID,
    website: p.website === '' ? null : p.website,
    twitter: p.twitter,
    orchid: p.orchid,
    linkedin: p.linkedin === '' ? null : LINKEDIN_REGEX.test(p.linkedin) ? p.linkedin : null,
    googleScholarId: p.googleScholarId,
    github: p.github,
    facebook: p.facebook,
    acceptedTerms: p.acceptedTerms === 'true',
    acceptedNihOptIn: p.acceptedNihOptIn === 'true',
    acceptedKfOptIn: p.acceptedKfOptIn === 'true',
    acceptedDatasetSub: p.acceptedDatasetSub === 'true',
    interests: p.interests === '' ? [] : p.interests.split(','),
    egoId: p.egoId === '' ? null : p.egoId,
    story: p.story,
    bio: p.bio,
});

export const createOrUpdate = async (payload: Persona): Promise<string> => {
    const existing = await UserModel.findAll({ where: { keycloak_id: payload.egoId } });
    if (existing.length === 0) {
        await UserModel.create({
            keycloak_id: payload.egoId,
            first_name: payload.firstName,
            last_name: payload.lastName,
            era_commons_id: payload.eraCommonsID,
            email: payload.loginEmail,
            linkedin: payload.linkedin,
            external_individual_email: payload.institutionalEmail,
            roles: payload.role,
            affiliation: payload.institution,
            consent_date: new Date('2021-11-22'),
            accepted_terms: payload.acceptedTerms,
            completed_registration: payload.acceptedTerms && payload.isActive,
            deleted: !payload.isActive,
            newsletter_email: payload.loginEmail,
            newsletter_subscription_status: payload.acceptedKfOptIn
                ? SubscriptionStatus.SUBSCRIBED
                : SubscriptionStatus.UNSUBSCRIBED,
            newsletter_dataset_subscription_status: payload.acceptedDatasetSub
                ? SubscriptionStatus.SUBSCRIBED
                : SubscriptionStatus.UNSUBSCRIBED,
            location_country: payload.country,
            location_state: payload.state,
            website: payload.website,
            areas_of_interest: payload.interests,
            is_public: payload.isPublic,
        });
        return 'created';
    } else if (existing.length === 1) {
        await UserModel.update(
            {
                first_name: payload.firstName,
                last_name: payload.lastName,
                era_commons_id: payload.eraCommonsID,
                email: payload.loginEmail,
                linkedin: payload.linkedin,
                external_individual_email: payload.institutionalEmail,
                roles: payload.role,
                affiliation: payload.institution,
                consent_date: new Date('2021-11-22'),
                accepted_terms: payload.acceptedTerms,
                completed_registration: payload.acceptedTerms && payload.isActive,
                deleted: !payload.isActive,
                newsletter_email: payload.loginEmail,
                newsletter_subscription_status: payload.acceptedKfOptIn
                    ? SubscriptionStatus.SUBSCRIBED
                    : SubscriptionStatus.UNSUBSCRIBED,
                newsletter_dataset_subscription_status: payload.acceptedDatasetSub
                    ? SubscriptionStatus.SUBSCRIBED
                    : SubscriptionStatus.UNSUBSCRIBED,
                location_country: payload.country,
                location_state: payload.state,
                website: payload.website,
                areas_of_interest: payload.interests,
                is_public: payload.isPublic,
            },
            { where: { keycloak_id: payload.egoId } },
        );
        return 'updated';
    } else {
        console.warn(`Duplicate user in users-api: ${payload.egoId}`);
    }
};
