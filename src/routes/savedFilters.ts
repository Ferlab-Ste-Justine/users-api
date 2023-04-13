import { Router } from 'express';
import { create, destroy, getAll, getById, update, updateAsDefault } from '../db/dal/savedFilter';
import { StatusCodes } from 'http-status-codes';

// Handles requests made to /saved-filters
const savedFiltersRouter = Router();

savedFiltersRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await getById(req.params.id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.get('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getAll(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.get('/tag/:tagid', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getAll(keycloak_id, req.params.tagid);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.post('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await create(keycloak_id, req.body);
        res.status(StatusCodes.CREATED).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.put('/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await update(keycloak_id, req.params.id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.put('/:id/default', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await updateAsDefault(keycloak_id, req.params.id, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.delete('/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await destroy(keycloak_id, req.params.id);
        res.status(StatusCodes.OK).send(req.params.id);
    } catch (e) {
        next(e);
    }
});

export default savedFiltersRouter;
