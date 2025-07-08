import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { refreshNewsletterStatus, subscribeNewsletter, unsubscribeNewsletter } from '../db/dal/newsletter';

const newsletterRouter = Router();

//@deprecated (newsletter_dataset_subcription). /refresh/:newsletter_type? should be /refresh, but it won t be touched at the moment cause it risks breaking stuff in INCLUDE
newsletterRouter.put('/refresh/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await refreshNewsletterStatus(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

//@deprecated (newsletter_dataset_subcription). /subscribe/:newsletter_type? should be /subscribe, but it won t be touched at the moment cause it risks breaking stuff in INCLUDE
newsletterRouter.put('/subscribe/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await subscribeNewsletter(keycloak_id, req.body.newsletter_email);

        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

//@deprecated (newsletter_dataset_subcription). /unsubscribe/:newsletter_type? should be /unsubscribe, but it won t be touched at the moment cause it risks breaking stuff in INCLUDE
newsletterRouter.put('/unsubscribe/:newsletter_type?', async (req, res, next) => {
    try {
        const keycloak_id = req['kauth']?.grant?.access_token?.content?.sub;
        const result = await unsubscribeNewsletter(keycloak_id);
        res.status(StatusCodes.OK).send(result);
    } catch (e) {
        next(e);
    }
});

export default newsletterRouter;
