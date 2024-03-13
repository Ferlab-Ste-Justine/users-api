import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import fetch from 'node-fetch';

import { smartsheetId, smartsheetToken } from '../config/env';
import config from '../config/project';
import { IUserOuput } from '../db/models/User';
import { SubscriptionStatus } from '../utils/newsletter';

const parseRoles = (roles: string[]) =>
    roles.map((role) => config.roleOptions.find((option) => option.value === role)?.label || role).join(', ');

const ColumnMappings = {
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Professional Title': 'roles',
    Organization: 'affiliation',
    Email: 'newsletter_email',
};

export const handleNewsletterUpdate = async (user: IUserOuput): Promise<string> => {
    if (!user.newsletter_email) {
        return SubscriptionStatus.FAILED;
    }

    try {
        const rowId = await fetchSubscription(user.newsletter_email);

        if (user.newsletter_subscription_status === SubscriptionStatus.SUBSCRIBED && !rowId) {
            return subscribeNewsletter(user);
        } else if (user.newsletter_subscription_status === SubscriptionStatus.UNSUBSCRIBED) {
            return unsubscribeNewsletter(rowId);
        }
        return user.newsletter_subscription_status;
    } catch {
        return SubscriptionStatus.FAILED;
    }
};

export const subscribeNewsletter = async (user: IUserOuput): Promise<string> => {
    const body = await formatRow(user);

    if (!body) return SubscriptionStatus.FAILED;

    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
        body,
    });

    return response.status === 200 ? SubscriptionStatus.SUBSCRIBED : SubscriptionStatus.FAILED;
};

export const unsubscribeNewsletter = async (rowId: string): Promise<string> => {
    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows?ids=${rowId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
    });

    return response.status === 200 ? SubscriptionStatus.UNSUBSCRIBED : SubscriptionStatus.FAILED;
};

export const fetchSubscription = async (newsletter_email: string): Promise<any> => {
    const response = await fetch(
        `https://api.smartsheet.com/2.0/search/sheets/${smartsheetId}?query=${newsletter_email}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${smartsheetToken}`,
                'Content-Type': 'application/json',
            },
        },
    );

    if (response.status !== 200) {
        throw new Error(response.statusText);
    }

    const parsedResponse = await response.json();

    return parsedResponse.results?.[0]?.objectId || undefined;
};

export const formatRow = async (user: IUserOuput): Promise<string> => {
    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 200) {
        const parsedResponse = await response.json();

        const row = [
            {
                toTop: true,
                cells: parsedResponse.columns
                    .filter((column) => ColumnMappings[column.title] !== undefined)
                    .map((column) => {
                        const mappedKey = ColumnMappings[column.title];

                        return mappedKey === 'roles'
                            ? {
                                  columnId: column.id,
                                  value: user[mappedKey] ? parseRoles(user[mappedKey]) : '',
                              }
                            : {
                                  columnId: column.id,
                                  value: user[mappedKey] || '',
                              };
                    }),
            },
        ];

        return JSON.stringify(row);
    }

    return undefined;
};
