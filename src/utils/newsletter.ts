import Realm from '../config/realm';
import UserModel from '../db/models/User';
import { handleNewsletterUpdate } from '../external/smartsheet';

export enum SubscriptionStatus {
    SUBSCRIBED = 'subscribed',
    UNSUBSCRIBED = 'unsubscribed',
    FAILED = 'failed',
}

export type NewsletterPayload = {
    user: UserModel;
    email: string;
    action: SubscriptionStatus;
};

export interface NewsletterHandler {
    (payload: NewsletterPayload): Promise<SubscriptionStatus>;
}

export const getNewsletterHandler = (realm: string): NewsletterHandler => {
    switch (realm) {
        case Realm.INCLUDE:
            return handleNewsletterUpdate;
        default:
            return undefined;
    }
};
