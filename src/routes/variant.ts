import { Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { addNewEntry, getEntriesByUniqueIdsAndOrganizations } from '../db/dal/variant';

const CLIN_GENETICIAN_ROLE = 'clin_genetician';

const EMPTY_PROPERTIES = { flags: [] };

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

function validateCreateOrDelete(userInfo: UserInfo, organization_id: string) {
    return userInfo.userRoles.indexOf(CLIN_GENETICIAN_ROLE) > -1 && userInfo.userOrganizations.indexOf(organization_id) > -1;
}

function validateGet(userInfo: UserInfo) {
    return userInfo.userRoles.indexOf(CLIN_GENETICIAN_ROLE) > -1;
}

const variantRouter = Router();

variantRouter.post('/:unique_id/:organization_id', async (req, res, next) => {
    try {
        const userInfo = getUserInfo(req);
        const canCreateOrDelete = validateCreateOrDelete(userInfo, req?.params?.organization_id);

        if (canCreateOrDelete) {
            const dbResponse = await addNewEntry(req?.params?.unique_id, req?.params?.organization_id, userInfo.authorId, req?.body);
            res.status(StatusCodes.CREATED).send(dbResponse);
        } else {
            res.sendStatus(StatusCodes.FORBIDDEN);
        }
    } catch (e) {
        next(e);
    }
});

variantRouter.get('/', async (req, res, next) => {
    try {
        const userInfo = getUserInfo(req);
        const canGet = validateGet(userInfo);

        let dbResponse = [];

        const uniqueIds = Array.isArray(req.query?.unique_id) ? req.query?.unique_id as string[] : [req.query?.unique_id as string];

        if (canGet) {
            dbResponse = await getEntriesByUniqueIdsAndOrganizations(uniqueIds, userInfo.userOrganizations);
        }

        res.status(StatusCodes.OK).send(dbResponse);
    } catch (e) {
        next(e);
    }
});

variantRouter.delete('/:unique_id/:organization_id', async (req, res, next) => {
    try {
        const userInfo = getUserInfo(req);
        const canCreateOrDelete = validateCreateOrDelete(userInfo, req?.params?.organization_id);

        if (canCreateOrDelete) {
            const dbResponse = await addNewEntry(req?.params?.unique_id, req?.params?.organization_id, userInfo.authorId, EMPTY_PROPERTIES);
            res.status(StatusCodes.CREATED).send(dbResponse);
        } else {
            res.sendStatus(StatusCodes.FORBIDDEN);
        }
    } catch (e) {
        next(e);
    }
});

export default variantRouter;