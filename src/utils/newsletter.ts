import Realm from '../config/realm';
import { IUserOuput } from '../db/models/User';
import { handleNewsletterUpdate } from '../external/smartsheet';

export const SubscriptionStatus = {
    SUBSCRIBED: 'subscribed',
    UNSUBSCRIBED: 'unsubscribed',
    FAILED: 'failed',
};

export interface NewsletterHandler {
    (payload: IUserOuput): Promise<string>;
}

export const getNewsletterHandler = (realm: string): NewsletterHandler => {
    switch (realm) {
        case Realm.INCLUDE:
            return handleNewsletterUpdate;
        default:
            return undefined;
    }
};
