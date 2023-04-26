import { Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Order } from 'sequelize';

import { keycloakRealm } from '../config/env';
import {
    completeRegistration,
    createUser,
    deleteUser,
    getProfileImageUploadPresignedUrl,
    getUserById,
    searchUsers,
    updateRolesAndDataUsages,
    updateUser,
} from '../db/dal/user';
import { getUserValidator } from '../utils/userValidator';

// Handles requests made to /users
const usersRouter = Router();

interface CustomReqQuery {
    pageSize?: string;
    pageIndex?: string;
    sort?: string;
    match?: string;
    roles?: string;
    dataUses?: string;
    researchDomains?: string;
}

/**
 *
 * Example search query params:
 *
 * pageSize     = 15
 * pageIndex    = 0
 * sort         = last_name:asc,creation_date:desc
 * roles        = Clinician,other
 * dataUses     = Commercial use,other
 *
 */
usersRouter.get('/search', async (req: Request<any, any, any, CustomReqQuery>, res, next) => {
    try {
        const pageSize = parseInt(req.query.pageSize || '15');
        const pageIndex = parseInt(req.query.pageIndex || '0');
        const roles = req.query.roles ? req.query.roles.split(',') : [];
        const dataUses = req.query.dataUses ? req.query.dataUses.split(',') : [];
        const researchDomains = req.query.researchDomains?.split(',') || [];

        let sorts: Order = [];
        if (req.query.sort) {
            sorts = req.query.sort.split(',').map((sortElement) => {
                const sortItems = sortElement.split(':');
                return [sortItems[0], sortItems[1].toUpperCase()];
            });
        }

        const result = await searchUsers({
            pageSize,
            pageIndex,
            sorts,
            match: req.query.match,
            roles,
            dataUses,
            researchDomains,
        });
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.get('/image/presigned', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getProfileImageUploadPresignedUrl(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.get('/:id?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const requestKeycloakId = req.params.id;

        const result = await getUserById(
            requestKeycloakId ?? keycloak_id,
            requestKeycloakId ? requestKeycloakId === keycloak_id : true,
        );
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.post('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await createUser(keycloak_id, req.body);
        res.status(StatusCodes.CREATED).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.put('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await updateUser(keycloak_id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.put('/complete-registration', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await completeRegistration(keycloak_id, req.body, getUserValidator(keycloakRealm));
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

usersRouter.delete('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        await deleteUser(keycloak_id);
        res.status(StatusCodes.OK).send({ success: true });
    } catch (e) {
        next(e);
    }
});

//todo: delete it after INCLUDE roles and data usages migration SJIP-340
usersRouter.put('/updateRolesAndDataUsages', async (req, res, next) => {
    try {
        await updateRolesAndDataUsages();
        res.status(StatusCodes.OK).send({ success: true });
    } catch (e) {
        next(e);
    }
});

export default usersRouter;
