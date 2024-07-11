import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { refreshNewsletterStatus, subscribeNewsletter, unsubscribeNewsletter } from '../db/dal/newsletter';

const newsletterRouter = Router();

newsletterRouter.put('/refresh/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const newsletter_type = req.params.newsletter_type;

        const result = await refreshNewsletterStatus(keycloak_id, newsletter_type);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

newsletterRouter.put('/subscribe/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const newsletter_type = req.params.newsletter_type;

        const result = await subscribeNewsletter(keycloak_id, req.body.newsletter_email, newsletter_type);

        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

newsletterRouter.put('/unsubscribe/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const newsletter_type = req.params.newsletter_type;
        const result = await unsubscribeNewsletter(keycloak_id, newsletter_type);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default newsletterRouter;
