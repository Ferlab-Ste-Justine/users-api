import { Router } from 'express';
import { isUserExists } from '../db/dal/user';
import { StatusCodes } from 'http-status-codes';
import createHttpError from 'http-errors';
import { keycloakURL } from '../env';
import { version } from '../../package.json';

// Handles public endpoint requests
const publicRouter = Router();

publicRouter.get('/status', (_req, res) =>
    res.send({
        version,
        keycloak: keycloakURL,
    }),
);

publicRouter.get('/user/exists', async (req, res, next) => {
    try {
        const keycloak_id = req.query.user_id;

        if (!keycloak_id) {
            throw createHttpError(StatusCodes.BAD_REQUEST, `Missing required query parameter "user_id".`);
        }

        const result = await isUserExists(keycloak_id as string);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default publicRouter;
