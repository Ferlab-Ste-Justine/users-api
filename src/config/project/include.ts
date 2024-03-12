const otherKey = 'other';

const profileImageExtension = 'jpeg';

const cleanedUserAttributes = [
    'id',
    'keycloak_id',
    'first_name',
    'last_name',
    'roles',
    'portal_usages',
    'creation_date',
    'updated_date',
    'public_email',
    'commercial_use_reason',
    'linkedin',
    'affiliation',
    'profile_image_key',
    'research_domains',
    'research_area_description',
    'locale',
    'newsletter_email',
    'newsletter_subscription_status',
];

const roleOptions = [
    {
        value: 'clinician',
        label: 'Clinician',
    },
    {
        value: 'community_member',
        label: 'Community Member',
    },
    {
        value: 'developer',
        label: 'Tool or Algorithm Developer',
    },
    {
        value: 'federal_employee',
        label: 'Federal Employee',
    },
    {
        value: 'researcher',
        label: 'Researcher at an Academic or not-for-profit Institution',
    },
    {
        value: 'representative',
        label: 'Representative from a for-profit or Commercial Entity',
    },
    {
        label: 'Other',
        value: 'other',
    },
];

const usageOptions = [
    {
        value: 'commercial_purpose',
        label: 'Commercial purposes',
    },
    {
        value: 'identifying_dataset',
        label: 'Identifying datasets that I want to analyze',
    },
    {
        value: 'help_design_new_research_study',
        label: 'Helping me design a new research study',
    },
    {
        value: 'learn_more_about_down_syndrome',
        label: 'Learning more about Down syndrome and its health outcomes, management, and/or treatment',
    },
];

export default {
    otherKey,
    profileImageExtension,
    cleanedUserAttributes,
    usageOptions,
    roleOptions,
};
