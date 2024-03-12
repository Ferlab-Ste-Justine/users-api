import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

import { smartsheetId, smartsheetToken } from '../config/env';
import { IUserOuput } from '../db/models/User';
import { SubscriptionStatus } from '../utils/newsletter';
import { fetchSubscription, handleNewsletterUpdate, subscribeNewsletter, unsubscribeNewsletter } from './smartsheet';
import * as smartsheetModule from './smartsheet';

describe('Newsletter Functions', () => {
    const user = {
        newsletter_email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        affiliation: 'Health Center',
        newsletter_subscription_status: SubscriptionStatus.SUBSCRIBED,
        roles: ['developer'],
    } as IUserOuput;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleNewsletterUpdate', () => {
        it('should call subscribeNewsletter when user is subscribed', async () => {
            jest.spyOn(smartsheetModule, 'subscribeNewsletter').mockImplementationOnce(jest.fn());
            await handleNewsletterUpdate(user);
            expect(subscribeNewsletter).toHaveBeenCalledWith(user);
        });

        it('should call unsubscribeNewsletter when user is unsubscribed', async () => {
            jest.spyOn(smartsheetModule, 'unsubscribeNewsletter').mockImplementationOnce(jest.fn());
            await handleNewsletterUpdate({ ...user, newsletter_subscription_status: SubscriptionStatus.UNSUBSCRIBED });
            expect(unsubscribeNewsletter).toHaveBeenCalledWith('test@example.com');
        });

        it('should not call any function if user subscription status is unknown', async () => {
            const subscribeNewsletterMock = jest.fn();
            const unsubscribeNewsletterMock = jest.fn();
            await handleNewsletterUpdate({ ...user, newsletter_subscription_status: SubscriptionStatus.FAILED });
            expect(subscribeNewsletterMock).not.toHaveBeenCalled();
            expect(unsubscribeNewsletterMock).not.toHaveBeenCalled();
        });
    });

    describe('subscribeNewsletter', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should throw error if newsletter_email is missing', async () => {
            await expect(subscribeNewsletter({ ...user, newsletter_email: undefined } as IUserOuput)).rejects.toThrow(
                createHttpError(
                    StatusCodes.BAD_REQUEST,
                    'Some required fields are missing to complete newsletter subscription',
                ),
            );
        });

        it('should return without calling fetch if there are existing subscriptions', async () => {
            const mockFetchSubscription = jest
                .fn()
                .mockResolvedValue({ results: [{ objectId: 'existingSubscriptionId' }] });
            jest.spyOn(smartsheetModule, 'fetchSubscription').mockImplementationOnce(mockFetchSubscription);
            global.fetch = jest.fn().mockImplementation(jest.fn());

            const result = await subscribeNewsletter(user as IUserOuput);

            expect(result).toBeUndefined();
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should make a POST request to subscribe', async () => {
            const mockFetchSubscription = jest.fn().mockResolvedValue({ results: [] });
            jest.spyOn(smartsheetModule, 'fetchSubscription').mockImplementationOnce(mockFetchSubscription);

            const mockResponse = { status: 200, json: jest.fn().mockResolvedValue({}) };
            global.fetch = jest.fn().mockResolvedValue(mockResponse);

            const result = await subscribeNewsletter(user as IUserOuput);

            expect(result).toEqual({});
            expect(fetch).toHaveBeenCalledWith(`https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${smartsheetToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([
                    {
                        toTop: true,
                        cells: [
                            { columnId: 2634539247921028, value: 'John' },
                            { columnId: 7138138875291524, value: 'Doe' },
                            { columnId: 1508639341078404, value: 'developer' },
                            { columnId: 4733421045999492, value: 'Health Center' },
                            { columnId: 1565260968683396, value: 'test@example.com' },
                        ],
                    },
                ]),
            });
        });
    });

    describe('unsubscribeNewsletter', () => {
        it('should throw error if newsletter_email is missing', async () => {
            await expect(unsubscribeNewsletter(undefined)).rejects.toThrow(
                createHttpError(
                    StatusCodes.BAD_REQUEST,
                    'Some required fields are missing to remove newsletter subscription',
                ),
            );
        });

        it('should throw error if no newsletter subscriptions are found', async () => {
            const mockFetchSubscription = jest.fn().mockResolvedValue({ results: [] });
            jest.spyOn(smartsheetModule, 'fetchSubscription').mockImplementationOnce(mockFetchSubscription);

            const newsletterEmail = 'test@example.com';
            await expect(unsubscribeNewsletter(newsletterEmail)).rejects.toThrow(
                createHttpError(StatusCodes.NOT_FOUND, `No newsletter subscription found for ${newsletterEmail}`),
            );
        });

        it('should make DELETE requests to unsubscribe', async () => {
            const mockFetchSubscription = jest.fn().mockResolvedValue({
                results: [{ objectId: '123' }, { objectId: '456' }],
            });
            jest.spyOn(smartsheetModule, 'fetchSubscription').mockImplementationOnce(mockFetchSubscription);

            const mockDeleteResponse = { status: 200 };
            const mockFetch = (global.fetch = jest.fn().mockResolvedValue(mockDeleteResponse));

            const newsletterEmail = 'test@example.com';
            await unsubscribeNewsletter(newsletterEmail);

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenCalledWith(
                `https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows?ids=123`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${smartsheetToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            expect(mockFetch).toHaveBeenCalledWith(
                `https://api.smartsheet.com/2.0/sheets/${smartsheetId}/rows?ids=456`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${smartsheetToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
        });
    });

    describe('fetchSubscription', () => {
        it('should return parsed response if status is 200', async () => {
            const mockResponse = { status: 200, json: jest.fn().mockResolvedValue({}) };
            global.fetch = jest.fn().mockResolvedValue(mockResponse);
            const result = await fetchSubscription(user.newsletter_email);
            expect(result).toEqual({});
        });

        it('should throw error if status is not 200', async () => {
            const mockResponse = { status: 500, json: jest.fn().mockResolvedValue('Something went wrong') };
            global.fetch = jest.fn().mockResolvedValue(mockResponse);
            await expect(fetchSubscription(user.newsletter_email)).rejects.toThrow(
                createHttpError(500, 'Something went wrong'),
            );
        });

        it('should throw error if fetch fails', async () => {
            const errorMessage = 'Failed to fetch';
            global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));
            await expect(fetchSubscription('user.newsletter_email')).rejects.toThrowError(errorMessage);
        });
    });
});
