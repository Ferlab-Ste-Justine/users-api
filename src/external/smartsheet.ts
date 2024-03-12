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
        throw createHttpError(
            StatusCodes.BAD_REQUEST,
            'Some required fields are missing to remove newsletter subscription',
        );
    }

    const rowId = await fetchSubscription(user.newsletter_email);

    if (user.newsletter_subscription_status === SubscriptionStatus.SUBSCRIBED && !rowId) {
        return subscribeNewsletter(user);
    } else if (user.newsletter_subscription_status === SubscriptionStatus.UNSUBSCRIBED) {
        return unsubscribeNewsletter(rowId);
    }

    return user.newsletter_subscription_status;
};

export const subscribeNewsletter = async (user: IUserOuput): Promise<string> => {
    const row = await formatRow(user);

    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
        body: row,
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

    const parsedResponse = await response.json();

    // TODO: Throw maybe? Because if not, it can be problematic. i.e the call fail but subscribe thinks its a good thing
    return response.status === 200 ? parsedResponse.results?.[0]?.objectId || undefined : undefined;
};

export const formatRow = async (user: IUserOuput): Promise<string> => {
    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
    });

    const parsedResponse = await response.json();

    // TODO handle if call failed or else it will try to filter on undef
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

    return response.status === 200 ? JSON.stringify(row) : undefined;
};
