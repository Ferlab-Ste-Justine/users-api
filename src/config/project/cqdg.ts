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
];

export const roleOptions = [
    {
        value: 'bioinformatician_software_developer',
        label: 'Bioinformatician, software developer',
    },
    {
        value: 'clinician',
        label: 'Clinician',
    },
    {
        value: 'employee_in_governmental_agency',
        label: 'Employee in a governmental agency',
    },
    {
        value: 'researcher_in_academic_or_non_profit_institution',
        label: 'Researcher in an academic or non-profit institution',
    },
    {
        value: 'representative_of_commercial_or_for_profit_company',
        label: 'Representative of a commercial or for-profit company',
    },
    {
        value: 'other',
        label: 'Other',
    },
];

export const researchDomainOptions = [
    {
        value: 'aging',
        label: 'Aging',
    },
    {
        value: 'bioinformatics',
        label: 'Bioinformatics',
    },
    {
        value: 'birth_defects',
        label: 'Birth Defects',
    },
    {
        value: 'cancer',
        label: 'Cancer',
    },
    {
        value: 'circulatory_respiratory_health',
        label: 'Circulatory and Respiratory Health',
    },
    {
        value: 'general_health',
        label: 'General Health',
    },
    {
        value: 'infection_immunity',
        label: 'Infection and Immunity',
    },
    {
        value: 'musculoskeletal_health_arthritis',
        label: 'Musculoskeletal Health and Arthritis',
    },
    {
        value: 'neurodevelopmental_conditions',
        label: 'Neurodevelopmental Conditions',
    },
    {
        value: 'neurosciences_mental_health_addiction',
        label: 'Neurosciences, Mental Health and Addiction',
    },
    {
        value: 'nutrition_metabolism_diabetes',
        label: 'Nutrition, Metabolism and Diabetes',
    },
    {
        value: 'population_genomics',
        label: 'Population Genomics',
    },
    {
        value: 'rare_diseases',
        label: 'Rare Diseases',
    },
    {
        label: 'Other',
        value: 'other',
    },
];

export default {
    otherKey,
    profileImageExtension,
    cleanedUserAttributes,
    researchDomainOptions,
    roleOptions,
};
