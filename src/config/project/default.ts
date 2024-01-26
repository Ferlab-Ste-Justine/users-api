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
    'locale'
];

export const roleOptions = [
    {
        value: 'clinician',
        label: 'Clinician',
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
        value: 'bioinformatician_software_developer',
        label: 'Bioinformatician, software developer',
    },
    {
        value: 'employee_in_governmental_agency',
        label: 'Employee in a governmental agency',
    },
    {
        value: 'other',
        label: 'Other',
    },
];

export const usageOptions = [
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
    usageOptions,
    roleOptions,
};
