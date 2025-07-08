import fetch from 'node-fetch';

import UserModel from '../db/models/User';
import { SubscriptionStatus } from '../utils/newsletter';
import {
    fetchSheet,
    findSubscription,
    formatRow,
    getSubscriptionStatus,
    handleNewsletterUpdate,
    subscribeNewsletter,
    unsubscribeNewsletter,
} from './smartsheet';
import { Column, Row, Sheet, SubscribeNewsletterPayload } from './smartsheetTypes';

const { Response } = jest.requireActual('node-fetch');
jest.mock('node-fetch', () => jest.fn());

describe('smartsheet', () => {
    const mockPayload = {
        email: 'test@example.com',
        action: SubscriptionStatus.SUBSCRIBED,
        user: {
            dataValues: {
                first_name: 'John',
                last_name: 'Doe',
                roles: ['role1', 'role2'],
                affiliation: 'Company',
                newsletter_email: 'test@example.com',
            },
        } as UserModel,
    };

    const mockSheet: Sheet = {
        version: 0,
        columns: [
            {
                id: 1,
                title: 'First Name',
            } as Column,
            {
                id: 2,
                title: 'Last Name',
            } as Column,
            {
                id: 3,
                title: 'Professional Title',
            } as Column,
            {
                id: 4,
                title: 'Organization',
            } as Column,
            {
                id: 5,
                title: 'Email',
            } as Column,
        ],
        rows: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleNewsletterUpdate', () => {
        it('should handle newsletter subscription successfully', async () => {
            fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockSheet)));

            fetch.mockResolvedValueOnce({
                ok: true,
            });

            const result = await handleNewsletterUpdate(mockPayload);

            expect(result).toEqual(SubscriptionStatus.SUBSCRIBED);
            expect(fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle newsletter unsubscription successfully', async () => {
            const unsubscribeMockSheet = {
                ...mockSheet,
                rows: [
                    {
                        id: 1,
                        cells: [
                            {
                                columnId: 5,
                                value: 'test@example.com',
                            },
                        ],
                    },
                ],
            };

            fetch.mockResolvedValueOnce(new Response(JSON.stringify(unsubscribeMockSheet)));

            fetch.mockResolvedValueOnce({
                ok: true,
            });

            const unsubscribePayload = { ...mockPayload, action: SubscriptionStatus.UNSUBSCRIBED };

            const result = await handleNewsletterUpdate(unsubscribePayload);

            expect(result).toEqual(SubscriptionStatus.UNSUBSCRIBED);
            expect(fetch).toHaveBeenCalledTimes(2);
        });

        it('should handle failure during newsletter subscription', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Failed',
            });

            const result = await handleNewsletterUpdate(mockPayload);

            expect(result).toEqual(SubscriptionStatus.FAILED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle missing email during newsletter update', async () => {
            const invalidPayload = { ...mockPayload, email: undefined };

            const result = await handleNewsletterUpdate(invalidPayload);

            expect(result).toEqual(SubscriptionStatus.FAILED);
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network Error'));

            const result = await handleNewsletterUpdate(mockPayload);

            expect(result).toEqual(SubscriptionStatus.FAILED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });
    describe('getSubscriptionStatus', () => {
        it('should return SUBSCRIBED if rowId is found', async () => {
            const subscribeMockSheet = {
                ...mockSheet,
                rows: [
                    {
                        id: 1,
                        cells: [
                            {
                                columnId: 5,
                                value: 'test@example.com',
                            },
                        ],
                    },
                ],
            };
            const email = 'test@example.com';

            fetch.mockResolvedValueOnce(new Response(JSON.stringify(subscribeMockSheet)));

            const result = await getSubscriptionStatus(email);

            expect(result).toBe(SubscriptionStatus.SUBSCRIBED);
        });

        it('should return UNSUBSCRIBED if no rowId is found', async () => {
            const unsubscribeMockSheet = {
                ...mockSheet,
                rows: [
                    {
                        id: 1,
                        cells: [
                            {
                                columnId: 5,
                                value: 'test@example.com',
                            },
                        ],
                    },
                ],
            };
            const email = 'nonexistent@example.com';

            fetch.mockResolvedValueOnce(new Response(JSON.stringify(unsubscribeMockSheet)));

            const result = await getSubscriptionStatus(email);

            expect(result).toBe(SubscriptionStatus.UNSUBSCRIBED);
        });

        it('should return FAILED if fetchSheet fails', async () => {
            fetch.mockRejectedValueOnce(new Error('Network Error'));
            const email = 'test@example.com';
            const result = await getSubscriptionStatus(email);

            expect(result).toBe(SubscriptionStatus.FAILED);
        });
    });

    describe('subscribeNewsletter', () => {
        it('should subscribe to newsletter successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
            });

            const mockRow = { toTop: true, cells: [] };

            const result = await subscribeNewsletter(mockRow);

            expect(result).toEqual(SubscriptionStatus.SUBSCRIBED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle failure during newsletter subscription', async () => {
            fetch.mockRejectedValueOnce(new Error('Network Error'));

            const mockRow = { toTop: true, cells: [] };

            const result = await subscribeNewsletter(mockRow);

            expect(result).toEqual(SubscriptionStatus.FAILED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('unsubscribeNewsletter', () => {
        it('should unsubscribe from newsletter successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
            });

            const result = await unsubscribeNewsletter(123);

            expect(result).toEqual(SubscriptionStatus.UNSUBSCRIBED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle failure during newsletter unsubscription', async () => {
            fetch.mockRejectedValueOnce(new Error('Network Error'));

            const result = await unsubscribeNewsletter(123);

            expect(result).toEqual(SubscriptionStatus.FAILED);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('fetchSheet', () => {
        it('should fetch sheet successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => mockSheet,
            });

            const result = await fetchSheet();

            expect(result).toEqual(mockSheet);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle failure during fetching sheet', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Failed',
            });

            await expect(fetchSheet()).rejects.toThrow('Could not retrieve smartsheet : Failed');
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('findSubscription', () => {
        const mockRows = [{ id: 1, cells: [{ value: 'test@example.com' }] } as Row];

        it('should find subscription', () => {
            const result = findSubscription(mockRows, 'test@example.com');
            expect(result).toEqual(1);
        });

        it('should return undefined if subscription not found', () => {
            const result = findSubscription(mockRows, 'notfound@example.com');
            expect(result).toBeUndefined();
        });
    });

    describe('formatRow', () => {
        it('should format row correctly', () => {
            const mockColumns = [{ id: 1, title: 'Email' } as Column];
            const mockUser: SubscribeNewsletterPayload = {
                first_name: 'John',
                last_name: 'Doe',
                roles: ['role1', 'role2'],
                affiliation: 'Company',
                newsletter_email: 'test@example.com',
            };

            const result = formatRow(mockColumns, mockUser);

            expect(result.cells).toHaveLength(1);
            expect(result.cells[0].value).toEqual('test@example.com');
        });
    });
});
