import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { create, destroy, getAll, getById, getByIdAndShared, share, update } from '../db/dal/userSets';

const userSetsRouter = Router();

userSetsRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await getById(req.params.id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.get('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getAll(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.post('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await create(keycloak_id, req.body);
        res.status(StatusCodes.CREATED).send(result);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.put('/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await update(keycloak_id, req.params.id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.delete('/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        await destroy(keycloak_id, req.params.id);
        res.status(StatusCodes.OK).send(req.params.id);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.get('/shared/:id', async (req, res, next) => {
    try {
        const result = await getByIdAndShared(req.params.id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

userSetsRouter.put('/shared/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await share(req.params.id, keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default userSetsRouter;
