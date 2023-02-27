import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { deleteUser } from '../db/dal/user';

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

export default adminRouter;
