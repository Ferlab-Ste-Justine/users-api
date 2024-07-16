import defaultConfig from './default';

const cleanedUserAttributes = [
    'keycloak_id',
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

const areaOfInterestOptions = [
    'Adolescent Idiopathic Scoliosis',
    'Bladder Exstrophy-Epispadias Complex',
    'Congenital Diaphragmatic Hernia',
    'Congenital Heart Defects',
    'Cornelia de Lange Syndrome',
    'Craniofacial Microsomia',
    'Disorders of Sex Development',
    'Enchondromatosis',
    'Esophageal Atresia & Tracheoesophageal',
    'Ewing Sarcoma - Genetic Risk',
    'Familial Leukemia',
    'Hemangiomas (PHACE)',
    'Intersections of Cancer & Structural Birth Defects',
    'Kidney and Urinary Tract Defects',
    'Laterality Birth Defects',
    'Leukemia & Heart Defects in Down Syndrome',
    'Microtia in Hispianic Populations',
    'Myeloid Malignancies',
    'Neuroblastoma',
    'Nonsyndromic Craniosynostosis',
    'Novel Cancer Susceptibility in Families (from BASIC3)',
    'Orofacial Cleft - African & Asian Ancestries',
    'Orofacial Cleft - European Ancestry',
    'Orofacial Cleft - Latin American Ancestry',
    'Osteosarcoma',
    'Pediatric Cancer Studies',
    'Syndromic Cranial Dysinnervation',
    'T-cell Acute Lymphoblastic Leukemia (ALL)',
].map((area) => ({ value: area.toLowerCase(), label: area }));

export default {
    ...defaultConfig,
    cleanedUserAttributes,
    roleOptions,
    areaOfInterestOptions,
};
