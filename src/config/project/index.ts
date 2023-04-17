import { keycloakRealm } from '../env';
import Realm from '../realm';
import defaultConfig from './default';
import includeConfig from './include';

/** to fill and use to handle multiple projects configurations */
const getConfig = () => {
    switch (keycloakRealm) {
        case Realm.INCLUDE:
            return includeConfig;
        case Realm.CQDG:
            return defaultConfig;
        default:
            return defaultConfig;
    }
};

export default getConfig();
