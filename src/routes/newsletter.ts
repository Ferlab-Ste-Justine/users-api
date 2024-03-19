import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { refreshNewsletterStatus, subscribeNewsletter, unsubscribeNewsletter } from '../db/dal/newsletter';

const newsletterRouter = Router();

newsletterRouter.put('/refresh', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await refreshNewsletterStatus(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

newsletterRouter.put('/subscribe', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await subscribeNewsletter(keycloak_id, req.body.newsletter_email);

        console.log(result);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

newsletterRouter.put('/unsubscribe', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await unsubscribeNewsletter(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default newsletterRouter;
