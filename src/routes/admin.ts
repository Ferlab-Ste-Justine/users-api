import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { keycloakRealm } from '../config/env';
import Realm from '../config/realm';
import { deleteUser, resetAllConsents } from '../db/dal/user';
import { createOrUpdate, getUserList, readCsv, validateUniqPersonas } from '../external/persona';

// Handles requests made to /admin
const adminRouter = Router();

adminRouter.delete('/deleteUser/:id', async (req, res, next) => {
    try {
        const requestKeycloakId = req.params.id;
        await deleteUser(requestKeycloakId);
        res.status(StatusCodes.OK).send(requestKeycloakId);
    } catch (e) {
        next(e);
    }
});

adminRouter.put('/resetAllConsents', async (req, res, next) => {
    try {
        const numberOfRowsUpdated = await resetAllConsents();
        res.status(StatusCodes.OK).send({ updated: numberOfRowsUpdated });
    } catch (e) {
        next(e);
    }
});

adminRouter.post('/doMigrationFromPersona', async (req, res, next) => {
    try {
        if (keycloakRealm !== Realm.KF) {
            res.status(StatusCodes.BAD_REQUEST).send('Not available for this project');
        } else {
            const csvContent: string = await getUserList(req.headers.authorization);
            const personas = await readCsv(csvContent);
            if (validateUniqPersonas(personas)) {
                const result = await Promise.all(personas.map((p) => createOrUpdate(p)));
                res.status(StatusCodes.OK).send({
                    created: result.filter((s) => s === 'created').length,
                    updated: result.filter((s) => s === 'updated').length,
                    ignored: result.filter((s) => s === 'ignored').length,
                });
            } else {
                res.status(StatusCodes.BAD_REQUEST).send('Duplicate persona, migration aborted');
            }
        }
    } catch (e) {
        next(e);
    }
});

export default adminRouter;
