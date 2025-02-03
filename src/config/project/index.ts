import { keycloakRealm } from '../env';
import Realm from '../realm';
import cqdgConfig from './cqdg';
import defaultConfig from './default';
import includeConfig from './include';
import kidsfirstConfig from './kidsfirst';
import unicConfig from './unic';

interface IProjectConfig {
    otherKey: string;
    profileImageExtension: string;
    cleanedUserAttributes: string[];
    roleOptions: { value: string; label: string }[];
    researchDomainOptions?: { value: string; label: string }[]; // researchDomainOptions used for CQDG
    usageOptions?: { value: string; label: string }[]; // usageOptions used for INCLUDE
    areaOfInterestOptions?: { value: string; label: string }[]; // areaOfInterestOptions used for KF
}

/** to fill and use to handle multiple projects configurations */
const getConfig = (): IProjectConfig => {
    switch (keycloakRealm) {
        case Realm.INCLUDE:
            return includeConfig;
        case Realm.CQDG:
            return cqdgConfig;
        case Realm.KF:
            return kidsfirstConfig;
        case Realm.CLIN:
            return defaultConfig;
        case Realm.UNIC:
            return unicConfig;
        default:
            return defaultConfig;
    }
};

export default getConfig();
