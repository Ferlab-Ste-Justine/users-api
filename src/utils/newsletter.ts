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

export const DATASET_NEWSLETTER_NAME = 'dataset';

export enum SubscriptionStatus {
    SUBSCRIBED = 'subscribed',
    UNSUBSCRIBED = 'unsubscribed',
    FAILED = 'failed',
}

export enum NewsletterType {
    INCLUDE = 'include',
    KIDSFIRST = 'kidsfirst',
    KIDSFIRST_DATASET = 'kidsfirst_dataset',
}

export type NewsletterPayload = {
    user: IUserOutput;
    email: string;
    action: SubscriptionStatus;
    type: NewsletterType;
};

export interface NewsletterUpdater {
    (payload: NewsletterPayload): Promise<SubscriptionStatus>;
}

export interface NewsletterStatusFetcher {
    (email: string, type: NewsletterType): Promise<SubscriptionStatus>;
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

export const getNewsletterType = (newsletterType: string, realm: string): NewsletterType => {
    switch (realm) {
        case Realm.INCLUDE:
            return NewsletterType.INCLUDE;
        case Realm.KF:
            if (newsletterType === DATASET_NEWSLETTER_NAME) return NewsletterType.KIDSFIRST_DATASET;
            return NewsletterType.KIDSFIRST;
        default:
            return undefined;
    }
};
