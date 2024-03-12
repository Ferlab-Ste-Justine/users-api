import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import fetch from 'node-fetch';

import { smartsheetId, smartsheetToken } from '../config/env';
import config from '../config/project';
import { IUserOuput } from '../db/models/User';

const parseRoles = (roles: string[]) =>
    roles.map((role) => config.roleOptions.find((option) => option.value === role)?.label || role).join(', ');

export const handleNewsletterUpdate = async (user: IUserOuput): Promise<any> => {
    switch (user.newsletter_subscription_status) {
        case 'subscribed':
            await subscribeNewsletter(user);
            break;
        case 'unsubscribed':
            await unsubscribeNewsletter(user.newsletter_email);
            break;
        default:
            break;
    }
};

export const subscribeNewsletter = async (user: IUserOuput): Promise<any> => {
    const url = `https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows`;
    const headers = {
        Authorization: `Bearer ${smartsheetToken}`,
        'Content-Type': 'application/json',
    };

    const { newsletter_email, first_name, last_name, roles, affiliation } = user;

    if (!newsletter_email) {
        throw createHttpError(
            StatusCodes.BAD_REQUEST,
            'Some required fields are missing to complete newsletter subscription',
        );
    }

    const { results } = await fetchSubscription(newsletter_email);

    if (results.length > 0) return;

    // TODO handle errors look at Arranger
    const body = [
        {
            toTop: true,
            cells: [
                {
                    columnId: 2634539247921028,
                    value: first_name || '',
                },
                {
                    columnId: 7138138875291524,
                    value: last_name || '',
                },
                {
                    columnId: 1508639341078404,
                    value: parseRoles(roles),
                },
                {
                    columnId: 4733421045999492,
                    value: affiliation || '',
                },
                {
                    columnId: 1565260968683396,
                    value: newsletter_email,
                },
            ],
        },
    ];

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    const parsedResponse = await response.json();

    return parsedResponse;
};

export const unsubscribeNewsletter = async (newsletter_email: string): Promise<any[]> => {
    if (!newsletter_email) {
        throw createHttpError(
            StatusCodes.BAD_REQUEST,
            'Some required fields are missing to remove newsletter subscription',
        );
    }

    const { results } = await fetchSubscription(newsletter_email);

    if (results.length === 0) {
        throw createHttpError(StatusCodes.NOT_FOUND, `No newsletter subscription found for ${newsletter_email}`);
    }

    const urls = results.map((row) => `https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows?ids=${row.objectId}`);
    const headers = {
        Authorization: `Bearer ${smartsheetToken}`,
        'Content-Type': 'application/json',
    };

    const responses = await Promise.allSettled(
        urls.map((url) =>
            fetch(url, {
                method: 'DELETE',
                headers: headers,
            }),
        ),
    );

    return responses;
};

export const fetchSubscription = async (newsletter_email: string): Promise<any> => {
    const url = `https://api.smartsheet.com/2.0/search/sheets/${smartsheetId}?query=${newsletter_email}`;
    const headers = {
        Authorization: `Bearer ${smartsheetToken}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        method: 'GET',
        headers: headers,
    });

    const parsedResponse = await response.json();

    if (response.status === 200) {
        return parsedResponse;
    }

    throw createHttpError(response.status, parsedResponse);
};
