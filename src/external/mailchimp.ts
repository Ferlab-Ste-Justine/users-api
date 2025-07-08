import { mailchimpApiKey, mailchimpKidsfirstListId, mailchimpUsername } from '../config/env';
import { NewsletterPayload, SubscriptionStatus } from '../utils/newsletter';

export const handleNewsletterUpdate = async (payload: NewsletterPayload): Promise<SubscriptionStatus> => {
    if (!payload.email) {
        console.error('Missing newsletter email');
        return SubscriptionStatus.FAILED;
    }

    try {
        return await sendSubscriptionPostRequest(payload);
    } catch (error) {
        console.error(error);
        return SubscriptionStatus.FAILED;
    }
};

const sendSubscriptionPostRequest = async (payload: NewsletterPayload): Promise<SubscriptionStatus> => {
    const { user, action, email } = payload;
    const mailChimpDataCenter = mailchimpApiKey.split('-')[1];
    const buff = Buffer.from(`${mailchimpUsername}:${mailchimpApiKey}`);
    const b64 = buff.toString('base64');

    const subscriptionUrl: string = (() =>
        retrieveMailchimpUrl(mailChimpDataCenter, mailchimpKidsfirstListId, email))();

    const response = await fetch(subscriptionUrl, {
        method: 'PUT',
        headers: {
            Authorization: `Basic ${b64}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email_address: email,
            status: action,
            merge_fields: {
                FNAME: user.first_name,
                LNAME: user.last_name,
            },
        }),
    });

    if (response.status !== 200) {
        const responseData = await response.text();
        console.error(`Failed to subscribe: ${responseData}`);
        return SubscriptionStatus.FAILED;
    }

    return action;
};

export const getSubscriptionStatus = async (email: string): Promise<SubscriptionStatus> => {
    if (!email) {
        console.error('Missing newsletter email');
        return SubscriptionStatus.FAILED;
    }

    try {
        return await sendGetSubscriptionRequest(email);
    } catch (error) {
        console.error(error);
        return SubscriptionStatus.FAILED;
    }
};

const sendGetSubscriptionRequest = async (email: string): Promise<SubscriptionStatus> => {
    const mailChimpDataCenter = mailchimpApiKey.split('-')[1];
    const buff = Buffer.from(`${mailchimpUsername}:${mailchimpApiKey}`);
    const b64 = buff.toString('base64');

    const subscriptionUrl: string = (() =>
        retrieveMailchimpUrl(mailChimpDataCenter, mailchimpKidsfirstListId, email))();

    const response = await fetch(subscriptionUrl, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${b64}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status !== 200) {
        const responseData = await response.text();
        console.error(`Failed to fetch: ${responseData}`);
        return SubscriptionStatus.FAILED;
    }

    const responseData = await response.json();

    return responseData.status === SubscriptionStatus.SUBSCRIBED
        ? SubscriptionStatus.SUBSCRIBED
        : SubscriptionStatus.UNSUBSCRIBED;
};

const retrieveMailchimpUrl = (server: string, listId: string, email: string) =>
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${email}`;
