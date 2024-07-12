import { keycloakRealm } from '../../config/env';
import {
    getNewsletterStatusFetcher,
    getNewsletterType,
    getNewsletterUpdater,
    NewsletterType,
    SubscriptionStatus,
} from '../../utils/newsletter';
import UserModel, { IUserOutput } from '../models/User';
import { getUserById } from './user';

export const subscribeNewsletter = async (
    keycloak_id: string,
    email: string,
    newsletter_type: string,
): Promise<IUserOutput> => {
    const newsletterUpdater = getNewsletterUpdater(keycloakRealm);
    const type = getNewsletterType(newsletter_type, keycloakRealm);

    const user = await getUserById(keycloak_id, true);

    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user,
            action: SubscriptionStatus.SUBSCRIBED,
            email,
            type,
        });

        const newsletter_email = newsletterStatus !== SubscriptionStatus.FAILED ? email : undefined;
        return updateUserNewsletterInfo(keycloak_id, type, newsletterStatus, newsletter_email);
    }

    return user;
};

export const unsubscribeNewsletter = async (keycloak_id: string, newsletter_type: string): Promise<IUserOutput> => {
    const newsletterUpdater = getNewsletterUpdater(keycloakRealm);
    const type = getNewsletterType(newsletter_type, keycloakRealm);

    const user = await getUserById(keycloak_id, true);

    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user: user as UserModel,
            action: SubscriptionStatus.UNSUBSCRIBED,
            email: user.newsletter_email,
            type,
        });

        const newsletter_email = newsletterStatus !== SubscriptionStatus.FAILED ? null : undefined;
        return updateUserNewsletterInfo(keycloak_id, type, newsletterStatus, newsletter_email);
    }

    return user;
};

export const refreshNewsletterStatus = async (keycloak_id: string, newsletter_type: string): Promise<IUserOutput> => {
    const newsletterStatusFetcher = getNewsletterStatusFetcher(keycloakRealm);
    const type = getNewsletterType(newsletter_type, keycloakRealm);

    const user = await getUserById(keycloak_id, true);
    const databaseNewsletterStatus =
        type === NewsletterType.KIDSFIRST_DATASET
            ? user.newsletter_dataset_subscription_status
            : user.newsletter_subscription_status;

    const isSubscribed = databaseNewsletterStatus === SubscriptionStatus.SUBSCRIBED;

    if (newsletterStatusFetcher && isSubscribed) {
        const newsletterStatus = await newsletterStatusFetcher(user.newsletter_email, type);

        if (newsletterStatus !== databaseNewsletterStatus) {
            const newsletter_email = newsletterStatus === SubscriptionStatus.UNSUBSCRIBED ? null : undefined;
            return updateUserNewsletterInfo(keycloak_id, type, newsletterStatus, newsletter_email);
        }
    }

    return user;
};

export const updateUserNewsletterInfo = async (
    keycloak_id: string,
    type: NewsletterType,
    status: SubscriptionStatus,
    newsletter_email?: string | null,
): Promise<IUserOutput> => {
    const payload =
        type === NewsletterType.KIDSFIRST_DATASET
            ? { newsletter_dataset_subscription_status: status }
            : { newsletter_subscription_status: status };

    const updatedUser = await UserModel.update(
        {
            ...payload,
            newsletter_email,
            updated_date: new Date(),
        },
        {
            where: {
                keycloak_id,
            },
            returning: true,
        },
    );

    return updatedUser[1][0];
};
