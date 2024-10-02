import { Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import Realm from '../config/realm';
import { keycloakRealm } from '../config/env';
import { addNewEntry, getEntriesByUniqueIdsAndOrganizations, getEntriesByPropertiesFlags } from '../db/dal/variant';

const CLIN_GENETICIAN_ROLE = 'clin_genetician';

const EMPTY_PROPERTIES = { };

interface UserInfo {
    authorId: string,
    userRoles: string[],
    userOrganizations: string[]
}

function getUserInfo(request: Request): UserInfo {
    const authorId = request['kauth']?.grant?.access_token?.content?.fhir_practitioner_id;
    const userRoles = request['kauth']?.grant?.access_token?.content?.realm_access?.roles;
    const userOrganizations = request['kauth']?.grant?.access_token?.content?.fhir_organization_id;
    return { authorId, userRoles, userOrganizations };
}

function validateCreate(userInfo: UserInfo, organization_id: string) {
    return userInfo.userRoles.indexOf(CLIN_GENETICIAN_ROLE) > -1 && userInfo.userOrganizations.indexOf(organization_id) > -1;
}

function validateGet(userInfo: UserInfo) {
    return userInfo.userRoles.indexOf(CLIN_GENETICIAN_ROLE) > -1;
}

const variantRouter = Router();

variantRouter.post('/:unique_id/:organization_id', async (req, res, next) => {
    try {
        if (keycloakRealm !== Realm.CLIN) {
            return res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
        }

        const userInfo = getUserInfo(req);
        const canCreate = validateCreate(userInfo, req?.params?.organization_id);

        if (canCreate) {
            const dbResponse = await addNewEntry(req?.params?.unique_id, req?.params?.organization_id, userInfo.authorId, req?.body || EMPTY_PROPERTIES);
            return res.status(StatusCodes.CREATED).send(dbResponse);
        } else {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        }
    } catch (e) {
        next(e);
    }
});

variantRouter.get('/', async (req, res, next) => {
    try {
        if (keycloakRealm !== Realm.CLIN) {
            return res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
        }

        const userInfo = getUserInfo(req);
        const canGet = validateGet(userInfo);

        let dbResponse = [];
        let uniqueIds = [];

        if (Array.isArray(req.query?.unique_id)) {
            uniqueIds.push(...req.query.unique_id);
        } else if (typeof req.query?.unique_id === 'string') {
            uniqueIds.push(req.query?.unique_id);
        }

        if (canGet && uniqueIds.length > 0) {
            dbResponse = await getEntriesByUniqueIdsAndOrganizations(uniqueIds, userInfo.userOrganizations);
            return res.status(StatusCodes.OK).send(dbResponse);
        } else if (!canGet) {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        } else {
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }

    } catch (e) {
        next(e);
    }
});

variantRouter.get('/filter', async (req, res, next) => {
    try {
        if (keycloakRealm !== Realm.CLIN) {
            return res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
        }

        const userInfo = getUserInfo(req);
        const canGet = validateGet(userInfo);

        let dbResponse = [];
        let flags = [];

        const flagsParam = req.query?.flag;
        if (Array.isArray(flagsParam)) {
            flags.push(...flagsParam);
        } else if (typeof flagsParam === 'string') {
            flags.push(flagsParam);
        }

        if (canGet && flags.length > 0) {
            dbResponse = await getEntriesByPropertiesFlags(flags, userInfo.userOrganizations);
            return res.status(StatusCodes.OK).send(dbResponse[0].map(r => r.unique_id));
        } else if (!canGet) {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        } else {
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
    } catch (e) {
        next(e);
    }
});

export default variantRouter;