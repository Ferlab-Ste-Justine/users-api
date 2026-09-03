import { createHash } from 'crypto';

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
            tags: ['KF Portal Sign Up'],
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

    const responseData = (await response.json()) as { status?: string };

    return responseData.status === SubscriptionStatus.SUBSCRIBED
        ? SubscriptionStatus.SUBSCRIBED
        : SubscriptionStatus.UNSUBSCRIBED;
};

// The api addresses a contact by the md5 of its lowercased email, never by the email itself. Hashing
// is also what stops a "/" or ".." in the value from retargeting the call at another list.
const subscriberHash = (email: string) => createHash('md5').update(email.toLowerCase()).digest('hex');

const retrieveMailchimpUrl = (server: string, listId: string, email: string) =>
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash(email)}`;
