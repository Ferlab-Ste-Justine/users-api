import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validate as validateUuid } from 'uuid';
import { create, destroy, getAll, getById, getByIdAndShared, getByIds, share, update } from '../db/dal/userSets';

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

userSetsRouter.post('/aliases', async (req, res, next) => {
    const addPrefix = (s: string) => 'set_id:' + s;
    const removePrefix = (s: string) => s.replace('set_id:', '');
    try {
        const setIds = (req.body?.['setIds'] || []).map(removePrefix).filter(validateUuid);
        const sets = await getByIds(setIds);
        const result = sets.map((x) => ({ setId: addPrefix(x.id), alias: x.alias }));
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default userSetsRouter;
