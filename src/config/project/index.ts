import { keycloakRealm } from '../env';
import Realm from '../realm';
import cqdgConfig from './cqdg';
import defaultConfig from './default';
import includeConfig from './include';

interface IProjectConfig {
    otherKey: string;
    profileImageExtension: string;
    cleanedUserAttributes: string[];
    roleOptions: { value: string; label: string }[];
    researchDomainOptions?: { value: string; label: string }[]; // researchDomainOptions used for CQDG
    usageOptions?: { value: string; label: string }[]; // usageOptions used for INCLUDE
}

/** to fill and use to handle multiple projects configurations */
const getConfig = (): IProjectConfig => {
    switch (keycloakRealm) {
        case Realm.INCLUDE:
            return includeConfig;
        case Realm.CQDG:
            return cqdgConfig;
        case Realm.KF:
            return defaultConfig;
        case Realm.CLIN:
            return defaultConfig;
        default:
            return defaultConfig;
    }
};

export default getConfig();
