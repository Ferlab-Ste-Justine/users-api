import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { retrieveUserCreatedSince } from '../db/dal/user';

// Handles requests made to /statistics
const statisticsRouter = Router();

statisticsRouter.get('/createdSince/:year/:month/:day', async (req, res, next) => {
    try {
        const year = req.params.year;
        const month = req.params.month;
        const day = req.params.day;
        const result = await retrieveUserCreatedSince(`${year}-${month}-${day}`);
        res.status(StatusCodes.OK).send({ result });
    } catch (e) {
        next(e);
    }
});

export default statisticsRouter;
