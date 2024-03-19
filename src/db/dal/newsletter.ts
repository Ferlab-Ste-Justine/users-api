import { getNewsletterStatusFetcher, getNewsletterUpdater, SubscriptionStatus } from '../../utils/newsletter';
import UserModel, { IUserOuput } from '../models/User';
import { getUserById } from './user';

export const subscribeNewsletter = async (keycloak_id: string, email: string): Promise<IUserOuput> => {
    const newsletterUpdater = getNewsletterUpdater('includedcc');

    const user = await getUserById(keycloak_id, true);

    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user: user,
            action: SubscriptionStatus.SUBSCRIBED,
            email,
        });

        return updateUserNewsletterInfo(keycloak_id, {
            newsletter_subscription_status: newsletterStatus,
            newsletter_email: newsletterStatus !== SubscriptionStatus.FAILED ? email : undefined,
        });
    }

    return user;
};

export const unsubscribeNewsletter = async (keycloak_id: string): Promise<IUserOuput> => {
    const newsletterUpdater = getNewsletterUpdater('includedcc');

    const user = await getUserById(keycloak_id, true);

    if (newsletterUpdater) {
        const newsletterStatus = await newsletterUpdater({
            user: user as UserModel,
            action: SubscriptionStatus.UNSUBSCRIBED,
            email: user.dataValues.newsletter_email,
        });

        return updateUserNewsletterInfo(keycloak_id, {
            newsletter_subscription_status: newsletterStatus,
            newsletter_email: newsletterStatus !== SubscriptionStatus.FAILED ? null : undefined,
        });
    }

    return user;
};

export const refreshNewsletterStatus = async (keycloak_id: string): Promise<IUserOuput> => {
    const newsletterStatusFetcher = getNewsletterStatusFetcher('includedcc');

    const user = await getUserById(keycloak_id, true);
    const isSubscribed = user.dataValues.newsletter_subscription_status === SubscriptionStatus.SUBSCRIBED;

    if (newsletterStatusFetcher && isSubscribed) {
        const newsletterStatus = await newsletterStatusFetcher(user.dataValues.newsletter_email);

        if (newsletterStatus !== user.dataValues.newsletter_subscription_status) {
            return updateUserNewsletterInfo(keycloak_id, {
                newsletter_subscription_status: newsletterStatus,
                newsletter_email: newsletterStatus === SubscriptionStatus.UNSUBSCRIBED ? null : undefined,
            });
        }
    }

    return user;
};

export const updateUserNewsletterInfo = async (
    keycloak_id: string,
    payload: {
        newsletter_subscription_status: SubscriptionStatus;
        newsletter_email?: string | null;
    },
): Promise<IUserOuput> => {
    const { newsletter_subscription_status, newsletter_email } = payload;
    const updatedUser = await UserModel.update(
        {
            newsletter_subscription_status,
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
