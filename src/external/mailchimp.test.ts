/* eslint-disable @typescript-eslint/no-var-requires */
import { IUserOutput } from '../db/models/User';
import { NewsletterPayload, NewsletterType, SubscriptionStatus } from '../utils/newsletter';
import { getSubscriptionStatus, handleNewsletterUpdate } from './mailchimp';

jest.mock('../config/env');

describe('Mailchimp service', () => {
    beforeEach(() => {
        (global.fetch as unknown as jest.Mock).mockReset();

        const env = require('../config/env');
        env.mailchimpApiKey = '11a11a11aa1a11aa11a11aa1111aa1a1-us13';
        env.mailchimpUsername = 'username';
        env.mailchimpKidsfirstListId = 'KF_ID';
        env.mailchimpKidsfirstDatasetListId = 'KF_DATASET_ID';
    });

    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
        } as Response),
    );

    const payload: NewsletterPayload = {
        user: {
            first_name: 'John',
            last_name: 'Doe',
        } as IUserOutput,
        email: 'newsletter_email',
        action: SubscriptionStatus.SUBSCRIBED,
        type: NewsletterType.KIDSFIRST,
    };

    describe('Update subscription state', () => {
        it('should do nothing and return FAILED if email is empty', async () => {
            const inputNull = { ...payload, email: null };
            const inputEmpty = { ...payload, email: '' };

            const outputNull = await handleNewsletterUpdate(inputNull);
            expect(outputNull).toBe(SubscriptionStatus.FAILED);

            const outputEmpty = await handleNewsletterUpdate(inputEmpty);
            expect(outputEmpty).toBe(SubscriptionStatus.FAILED);

            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(0);
        });

        it('should return FAILED if request to mailchimp fails', async () => {
            const errorMessage = 'OOPS from Mailchimp';
            const mockResponse = { status: 400, text: () => errorMessage };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await handleNewsletterUpdate(payload);
            expect(output).toBe(SubscriptionStatus.FAILED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should determine mailchimp URL based on newsletter type', async () => {
            const mockResponse = { status: 200, text: () => 'Mock success' };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            await handleNewsletterUpdate(payload);
            await handleNewsletterUpdate({ ...payload, type: NewsletterType.KIDSFIRST_DATASET });

            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(2);
            expect((global.fetch as unknown as jest.Mock).mock.calls[0][0]).toEqual(
                'https://us13.api.mailchimp.com/3.0/lists/KF_ID/members/newsletter_email',
            );
            expect((global.fetch as unknown as jest.Mock).mock.calls[1][0]).toEqual(
                'https://us13.api.mailchimp.com/3.0/lists/KF_DATASET_ID/members/newsletter_email',
            );
        });

        it('should return SUBSCRIBED if subscription request to mailchimp succeeds', async () => {
            const mockResponse = { status: 200, text: () => 'Mock success' };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await handleNewsletterUpdate(payload);

            expect(output).toBe(SubscriptionStatus.SUBSCRIBED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should return UNSUBSCRIBED if unsubscription request to mailchimp succeeds', async () => {
            const mockResponse = { status: 200, text: () => 'Mock success' };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await handleNewsletterUpdate({ ...payload, action: SubscriptionStatus.UNSUBSCRIBED });

            expect(output).toBe(SubscriptionStatus.UNSUBSCRIBED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });
    });

    describe('Get subscription status', () => {
        it('should do nothing and return FAILED if email is empty', async () => {
            const outputNull = await getSubscriptionStatus(null, NewsletterType.KIDSFIRST);
            expect(outputNull).toBe(SubscriptionStatus.FAILED);

            const outputEmpty = await getSubscriptionStatus('', NewsletterType.KIDSFIRST);
            expect(outputEmpty).toBe(SubscriptionStatus.FAILED);

            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(0);
        });

        it('should return FAILED if request to mailchimp fails', async () => {
            const errorMessage = 'OOPS from Mailchimp';
            const mockResponse = { status: 400, text: () => errorMessage };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await getSubscriptionStatus('newsletter_email', NewsletterType.KIDSFIRST);
            expect(output).toBe(SubscriptionStatus.FAILED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should determine mailchimp URL based on newsletter type', async () => {
            const mockResponse = { status: 200, text: () => 'Mock success' };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            await getSubscriptionStatus('newsletter_email', NewsletterType.KIDSFIRST);
            await getSubscriptionStatus('newsletter_email', NewsletterType.KIDSFIRST_DATASET);

            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(2);
            expect((global.fetch as unknown as jest.Mock).mock.calls[0][0]).toEqual(
                'https://us13.api.mailchimp.com/3.0/lists/KF_ID/members/newsletter_email',
            );
            expect((global.fetch as unknown as jest.Mock).mock.calls[1][0]).toEqual(
                'https://us13.api.mailchimp.com/3.0/lists/KF_DATASET_ID/members/newsletter_email',
            );
        });

        it('should return SUBSCRIBED if status in mailchimp response is subscribed', async () => {
            const mockResponse = {
                status: 200,
                json: () => ({
                    status: SubscriptionStatus.SUBSCRIBED,
                }),
            };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await getSubscriptionStatus('newsletter_email', NewsletterType.KIDSFIRST);
            expect(output).toBe(SubscriptionStatus.SUBSCRIBED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should return UNSUBSCRIBED if status in mailchimp response is not subscribed', async () => {
            const mockResponse = {
                status: 200,
                json: () => ({
                    status: SubscriptionStatus.UNSUBSCRIBED,
                }),
            };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const output = await getSubscriptionStatus('newsletter_email', NewsletterType.KIDSFIRST);
            expect(output).toBe(SubscriptionStatus.UNSUBSCRIBED);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });
    });
});
