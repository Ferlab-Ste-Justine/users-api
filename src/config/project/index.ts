import { keycloakRealm } from '../env';
import Realm from '../realm';
import cqdgConfig from './cqdg';
import defaultConfig from './default';
import includeConfig from './include';

/** to fill and use to handle multiple projects configurations */
const getConfig = () => {
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
