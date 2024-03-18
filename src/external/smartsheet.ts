import fetch from 'node-fetch';

import { smartsheetId, smartsheetToken } from '../config/env';
import config from '../config/project';
import { NewsletterPayload, SubscriptionStatus } from '../utils/newsletter';
import { Column, FormattedRow, Row, Sheet, SubscribeNewsletterPayload } from './smartsheetTypes';

const parseRoles = (roles: string[]) =>
    roles.map((role) => config.roleOptions.find((option) => option.value === role)?.label || role).join(', ');

const ColumnMappings: Record<string, string> = {
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Professional Title': 'roles',
    Organization: 'affiliation',
    Email: 'newsletter_email',
};

export const handleNewsletterUpdate = async (payload: NewsletterPayload): Promise<SubscriptionStatus> => {
    if (!payload.email) {
        console.error('Missing newsletter email');
        return SubscriptionStatus.FAILED;
    }

    try {
        const smartsheet = await fetchSheet();
        const rowId = findSubscription(smartsheet.rows, payload.email);

        if (!rowId && payload.action === SubscriptionStatus.SUBSCRIBED) {
            const formattedRow = formatRow(smartsheet.columns, {
                ...payload.user.dataValues,
                newsletter_email: payload.email,
            });

            return subscribeNewsletter(formattedRow);
        } else if (rowId && payload.action === SubscriptionStatus.UNSUBSCRIBED) {
            return unsubscribeNewsletter(rowId);
        }

        return payload.action;
    } catch (error) {
        console.error(error);
        return SubscriptionStatus.FAILED;
    }
};

export const subscribeNewsletter = async (row: FormattedRow): Promise<SubscriptionStatus> => {
    try {
        await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${smartsheetToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([row]),
        });
        return SubscriptionStatus.SUBSCRIBED;
    } catch (error) {
        console.error(`Failed to Subscribe to newsletter: ${error}`);
        return SubscriptionStatus.FAILED;
    }
};

export const unsubscribeNewsletter = async (rowId: number): Promise<SubscriptionStatus> => {
    try {
        await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows?ids=${rowId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${smartsheetToken}`,
                'Content-Type': 'application/json',
            },
        });
        return SubscriptionStatus.UNSUBSCRIBED;
    } catch (error) {
        console.error(`Failed to Unsubscribe to newsletter: ${error}`);
        return SubscriptionStatus.FAILED;
    }
};

export const fetchSheet = async (): Promise<Sheet> => {
    const response = await fetch(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${smartsheetToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Could not retrieve smartsheet : ${response.statusText}`);
    }

    return response.json();
};

export const findSubscription = (rows: Row[], newsletter_email: string): number | undefined => {
    for (const row of rows) {
        if (row.cells.some((cell) => cell.value === newsletter_email)) {
            return row.id;
        }
    }

    return undefined;
};

export const formatRow = (columns: Column[], user: SubscribeNewsletterPayload): FormattedRow => {
    const relevantColumns = columns.filter((column) => ColumnMappings[column.title] !== undefined);

    const formattedCells = relevantColumns.map((column) => {
        const mappedKey = ColumnMappings[column.title];
        const value =
            mappedKey === 'roles' ? (user[mappedKey] ? parseRoles(user[mappedKey]) : '') : user[mappedKey] || '';
        return { columnId: column.id, value };
    });

    return { toTop: true, cells: formattedCells };
};
