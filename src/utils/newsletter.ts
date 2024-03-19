import Realm from '../config/realm';
import UserModel from '../db/models/User';
import { getSubscriptionStatus, handleNewsletterUpdate } from '../external/smartsheet';

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

export interface NewsletterUpdater {
    (email: NewsletterPayload): Promise<SubscriptionStatus>;
}

export interface NewsletterStatusFetcher {
    (email: string): Promise<SubscriptionStatus>;
}

export const getNewsletterUpdater = (realm: string): NewsletterUpdater => {
    switch (realm) {
        case Realm.INCLUDE:
            return handleNewsletterUpdate;
        default:
            return undefined;
    }
};

export const getNewsletterStatusFetcher = (realm: string): NewsletterStatusFetcher => {
    switch (realm) {
        case Realm.INCLUDE:
            return getSubscriptionStatus;
        default:
            return undefined;
    }
};
