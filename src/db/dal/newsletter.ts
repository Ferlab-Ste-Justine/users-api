import { keycloakRealm } from '../../config/env';
import { getNewsletterStatusFetcher, getNewsletterUpdater, SubscriptionStatus } from '../../utils/newsletter';
import UserModel, { IUserOutput } from '../models/User';
import { getUserById } from './user';

export const subscribeNewsletter = async (keycloak_id: string, email: string): Promise<IUserOutput> => {
    const newsletterUpdater = getNewsletterUpdater(keycloakRealm);
    const user = await getUserById(keycloak_id, true);
    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user,
            action: SubscriptionStatus.SUBSCRIBED,
            email,
        });

        const newsletter_email = newsletterStatus !== SubscriptionStatus.FAILED ? email : undefined;
        return updateUserNewsletterInfo(keycloak_id, newsletterStatus, newsletter_email);
    }

    return user;
};

export const unsubscribeNewsletter = async (keycloak_id: string): Promise<IUserOutput> => {
    const newsletterUpdater = getNewsletterUpdater(keycloakRealm);
    const user = await getUserById(keycloak_id, true);
    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user: user as UserModel,
            action: SubscriptionStatus.UNSUBSCRIBED,
            email: user.newsletter_email,
        });

        const newsletter_email = newsletterStatus !== SubscriptionStatus.FAILED ? null : undefined;
        return updateUserNewsletterInfo(keycloak_id, newsletterStatus, newsletter_email);
    }

    return user;
};

export const refreshNewsletterStatus = async (keycloak_id: string): Promise<IUserOutput> => {
    const newsletterStatusFetcher = getNewsletterStatusFetcher(keycloakRealm);
    const user = await getUserById(keycloak_id, true);
    const databaseNewsletterStatus = user.newsletter_subscription_status;

    const isSubscribed = databaseNewsletterStatus === SubscriptionStatus.SUBSCRIBED;

    if (newsletterStatusFetcher && isSubscribed) {
        const newsletterStatus = await newsletterStatusFetcher(user.newsletter_email);

        if (newsletterStatus !== databaseNewsletterStatus) {
            const newsletter_email = newsletterStatus === SubscriptionStatus.UNSUBSCRIBED ? null : undefined;
            return updateUserNewsletterInfo(keycloak_id, newsletterStatus, newsletter_email);
        }
    }

    return user;
};

export const updateUserNewsletterInfo = async (
    keycloak_id: string,
    status: SubscriptionStatus,
    newsletter_email?: string | null,
): Promise<IUserOutput> => {
    const payload = { newsletter_subscription_status: status };

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
