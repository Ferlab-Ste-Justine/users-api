import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { exportAllUsers, retrieveUserCreatedSince } from '../db/dal/user';
import { writeUserListInCsv } from '../utils/csvWriter';

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

statisticsRouter.get('/exportAll/:format', async (req, res, next) => {
    try {
        if (req.params.format === 'json') {
            const users = await exportAllUsers();
            return res.status(StatusCodes.OK).send(users);
        }

        if (req.params.format === 'csv') {
            const users = await exportAllUsers();
            return writeUserListInCsv(users, res);
        }

        return res.status(StatusCodes.BAD_REQUEST).send('Unsupported format');
    } catch (e) {
        next(e);
    }
});

export default statisticsRouter;
