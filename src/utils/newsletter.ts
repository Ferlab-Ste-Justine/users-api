import Realm from '../config/realm';
import { IUserOutput } from '../db/models/User';
import {
    getSubscriptionStatus as mailchimpGetSubscriptionStatus,
    handleNewsletterUpdate as mailchimpHandleNewsletterUpdate,
} from '../external/mailchimp';
import {
    getSubscriptionStatus as smartsheetGetSubscriptionStatus,
    handleNewsletterUpdate as smartsheetHandleNewsletterUpdate,
} from '../external/smartsheet';

export enum SubscriptionStatus {
    SUBSCRIBED = 'subscribed',
    UNSUBSCRIBED = 'unsubscribed',
    FAILED = 'failed',
}

export type NewsletterPayload = {
    user: IUserOutput;
    email: string;
    action: SubscriptionStatus;
};

export interface NewsletterUpdater {
    (payload: NewsletterPayload): Promise<SubscriptionStatus>;
}

export interface NewsletterStatusFetcher {
    (email: string): Promise<SubscriptionStatus>;
}

export const getNewsletterUpdater = (realm: string): NewsletterUpdater => {
    switch (realm) {
        case Realm.INCLUDE:
            return smartsheetHandleNewsletterUpdate;
        case Realm.KF:
            return mailchimpHandleNewsletterUpdate;
        default:
            return undefined;
    }
};

export const getNewsletterStatusFetcher = (realm: string): NewsletterStatusFetcher => {
    switch (realm) {
        case Realm.INCLUDE:
            return smartsheetGetSubscriptionStatus;
        case Realm.KF:
            return mailchimpGetSubscriptionStatus;
        default:
            return undefined;
    }
};
