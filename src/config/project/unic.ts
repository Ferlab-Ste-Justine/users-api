const otherKey = 'other';

const profileImageExtension = 'jpeg';

const cleanedUserAttributes = [
    'id',
    'keycloak_id',
    'first_name',
    'last_name',
    'title',
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
    'locale',
];

export const roleOptions = [
    {
        value: 'bioinformatician_software_developer',
        label: 'Bioinformatician, data analyst, statistician',
    },
    {
        value: 'researcher_in_academic_or_non_profit_institution',
        label: 'Researcher in an academic or non-profit institution',
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
        value: 'representative_of_commercial_or_for_profit_company',
        label: 'Representative of a commercial or for-profit company',
    },
    {
        value: 'manager',
        label: 'Manager',
    },
    {
        value: 'student',
        label: 'Student',
    },
];

export const researchDomainOptions = [
    {
        value: 'bioinformatics',
        label: 'Bioinformatics',
    },
    {
        value: 'cancer',
        label: 'Cancer',
    },
    {
        value: 'neurodevelopmental_conditions',
        label: 'Neurodevelopmental Conditions',
    },
    {
        value: 'population_genomics',
        label: 'Population Genomics',
    },
    {
        value: 'infection_immunity',
        label: 'Infection and Immunity',
    },
    {
        value: 'ia',
        label: 'Artificial intelligence',
    },
    {
        value: 'rare_diseases',
        label: 'Rare Diseases',
    },
    {
        value: 'birth_defects',
        label: 'Congenital malformations',
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
        value: 'circulatory_respiratory_health',
        label: 'Circulatory and Respiratory Health',
    },
    {
        value: 'general_health',
        label: 'General Health',
    },
    {
        value: 'musculoskeletal_health_arthritis',
        label: 'Musculoskeletal Health and Arthritis',
    },
    {
        value: 'aging',
        label: 'Aging',
    },
];

export default {
    otherKey,
    profileImageExtension,
    cleanedUserAttributes,
    researchDomainOptions,
    roleOptions,
};
