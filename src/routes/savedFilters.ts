import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { create, destroy, getAll, getById, getFiltersUsingQuery, update, updateAsDefault } from '../db/dal/savedFilter';
import { removeQueryFromFilters, updateQuery } from '../utils/savedFilters';
// Handles requests made to /saved-filters
const savedFiltersRouter = Router();

savedFiltersRouter.get('/:id', async (req, res, next) => {
    try {
        const result = await getById(req.params.id);
        result.queries = await Promise.all(result.queries.map((query) => updateQuery(query)));
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.get('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const results: any = await getAll({ keycloak_id, type: req.query.type } as any);
        if (req.query.type === 'filter' || !req.query.type) {
            const updatedResults = [];
            for (let i = 0; i < results.length - 1; i++) {
                const result = results[i];
                result.queries = await Promise.all(result.queries.map((query) => updateQuery(query)));
                updatedResults.push(result);
            }
            res.status(StatusCodes.OK).send(updatedResults);
        }

        res.status(StatusCodes.OK).send(results);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.get('/tag/:tagid', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getAll({ keycloak_id, tagid: req.params.tagid } as any);
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
        await destroy(keycloak_id, req.params.id);
        if (req.query.type && req.query.type === 'query') {
            const filtersToUpdate = await getFiltersUsingQuery(req.params.id);
            try {
                await Promise.all(
                    removeQueryFromFilters(filtersToUpdate, req.params.id).map((a) => update(keycloak_id, a.id, a)),
                );
            } catch (e) {
                console.error(e);
            }
        }
        res.status(StatusCodes.OK).send(req.params.id);
    } catch (e) {
        next(e);
    }
});

export default savedFiltersRouter;
