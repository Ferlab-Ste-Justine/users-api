import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
    create,
    createQueriesAndUpdateBody,
    destroy,
    getAll,
    getById,
    getFiltersUsingQuery,
    update,
    updateAsDefault,
} from '../db/dal/savedFilter';
import {
    formatByTag,
    getFilterIDs,
    handleUniqueName,
    removeQueryFromFilters,
    uniqueNameErrorHandler,
    updateQuery,
} from '../utils/savedFilters';

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
        const type = req.query?.type as string;
        const results = await getAll({ keycloak_id, type });
        if (type === 'filter' || !type) {
            const updatedResults = [];
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                result.queries = await Promise.all(result.queries.map(async (query) => await updateQuery(query)));
                updatedResults.push(result);
            }
            res.status(StatusCodes.OK).send(updatedResults);
        } else {
            res.status(StatusCodes.OK).send(formatByTag(results));
        }
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.get('/tag/:tagid', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const type = req.query?.type as string;
        const tag = req.params?.tagid;
        const result = await getAll({ keycloak_id, tag, type });
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

savedFiltersRouter.post('/', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        // add logics to save "pills" before creating the filter
        if (JSON.stringify(req.body).includes('filterID')) {
            const filters = getFilterIDs(req.body);
            const filtersWithIds = await Promise.all(Object.values(filters).map(({ filterID }) => getById(filterID)));
            const newBody = await createQueriesAndUpdateBody(req.body, filtersWithIds, keycloak_id);

            const result = await create(keycloak_id, newBody as any);
            result.queries = await Promise.all(result.queries.map(async (query) => await updateQuery(query)));

            res.status(StatusCodes.CREATED).send(result);
        } else {
            const result = await create(keycloak_id, req.body);
            res.status(StatusCodes.CREATED).send(result);
        }
    } catch (e) {
        uniqueNameErrorHandler(e, res);
        next(e);
    }
});

savedFiltersRouter.put('/:id', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await update(keycloak_id, req.params.id, req.body);
        if (JSON.stringify(req.body).includes('filterID')) {
            result.queries = await Promise.all(result.queries.map(async (query) => await updateQuery(query)));
        }
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        uniqueNameErrorHandler(e, res);
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
            const filtersToUpdate = await getFiltersUsingQuery(req.params.id, keycloak_id);
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

savedFiltersRouter.get('/withQueryId/:id', async (req: any, res) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await getFiltersUsingQuery(req.params.id, keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (err) {
        console.error(err);
    }
});

savedFiltersRouter.post('/validate-name', async (req: any, res: any, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        await handleUniqueName({ ...req.body, keycloak_id });
        res.status(StatusCodes.OK).send({ valid: true });
    } catch (err) {
        uniqueNameErrorHandler(err, res);
        next(err);
    }
});

export default savedFiltersRouter;
