import { format } from '@fast-csv/format';

import UserModel from '../db/models/User';

export const writeUserListInCsv = (users: UserModel[], res) => {
    const csvStream = format({ headers: true });

    res.setHeader('Content-disposition', 'attachment; filename="members.csv"');
    res.setHeader('Content-Type', 'text/csv');

    csvStream.pipe(res);
    users.forEach((u) => {
        csvStream.write({
            id: u.id,
            keycloak_id: u.keycloak_id,
            first_name: u.first_name,
            last_name: u.last_name,
            era_commons_id: u.era_commons_id,
            email: u.email,
            linkedin: u.linkedin,
            public_email: u.public_email,
            external_individual_fullname: u.external_individual_fullname,
            external_individual_email: u.external_individual_email,
            profile_image_key: u.profile_image_key,
            roles: u.roles,
            affiliation: u.affiliation,
            portal_usages: u.portal_usages,
            research_domains: u.research_domains,
            research_area_description: u.research_area_description,
            creation_date: u.creation_date,
            updated_date: u.updated_date,
            consent_date: u.consent_date,
            accepted_terms: u.accepted_terms,
            understand_disclaimer: u.understand_disclaimer,
            commercial_use_reason: u.commercial_use_reason,
            completed_registration: u.completed_registration,
            deleted: u.deleted,
            locale: u.locale,
            newsletter_email: u.newsletter_email,
            newsletter_subscription_status: u.newsletter_subscription_status,
            newsletter_dataset_subscription_status: u.newsletter_dataset_subscription_status,
            location_country: u.location_country,
            location_state: u.location_state,
            website: u.website,
            areas_of_interest: u.areas_of_interest,
            is_public: u.is_public,
        });
    });
    csvStream.end();
};
