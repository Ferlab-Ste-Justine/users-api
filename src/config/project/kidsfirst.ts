const cleanedUserAttributes = [
    'id',
    'keycloak_id',
    'creation_date',
    'updated_date',
    'first_name',
    'last_name',
    'linkedin',
    'website',
    'affiliation',
    'roles',
    'location_country',
    'location_state',
    'areas_of_interest',
    'locale',
    'newsletter_email',
    'newsletter_subscription_status',
    'newsletter_dataset_subscription_status',
];

const roleOptions = [
    {
        value: 'research',
        label: 'Researcher',
    },
    {
        value: 'health',
        label: 'Healthcare Professional',
    },
    {
        value: 'patient',
        label: 'Patient/Family Member',
    },
    {
        value: 'community',
        label: 'Community Member',
    },
];

export default {
    cleanedUserAttributes,
    roleOptions,
};
