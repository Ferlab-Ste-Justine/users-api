import { Express } from 'express';
import Keycloak from 'keycloak-connect';
import request from 'supertest';

import { getToken, publicKey } from '../../test/authTestUtils';
import buildApp from '../app';
import { subscribeNewsletter } from '../db/dal/newsletter';
import * as savedFilterDal from '../db/dal/savedFilter';
import { createUser, getUserById, updateUser } from '../db/dal/user';
import { create as createUserSet, getByIds } from '../db/dal/userSets';
import { IUserInput } from '../db/models/User';

jest.mock('../db/dal/newsletter');
jest.mock('../db/dal/user');
jest.mock('../db/dal/userSets');

const checkBody = (expectedBody) => (res) => {
    expect(JSON.stringify(res.body)).toEqual(JSON.stringify(expectedBody));
};

describe('Express app', () => {
    let app: Express;
    let keycloakFakeConfig;

    beforeEach(() => {
        const publicKeyToVerify = publicKey;
        keycloakFakeConfig = {
            realm: 'master',
            'confidential-port': 0,
            'bearer-only': true,
            'auth-server-url': 'http://localhost:8080/auth',
            'ssl-required': 'external',
            resource: 'keycloakFakeCLient',
            'realm-public-key': publicKeyToVerify, // For test purpose, we use public key to validate token.
        };
        const keycloak = new Keycloak({}, keycloakFakeConfig);
        app = buildApp(keycloak); // Re-create app between each test to ensure isolation between tests.
    });

    describe('GET /status', () => {
        it('should return 200', async () => request(app).get('/status').expect(200));
    });

    describe('GET /user', () => {
        beforeEach(() => {
            (getUserById as jest.Mock).mockReset();
        });

        it('should return 403 if no Authorization header', async () => request(app).get('/user').expect(403));

        it('should return 403 if Authorization header contain expired token', async () => {
            const token = getToken(-1000);
            await request(app)
                .get('/user')
                .set({ Authorization: `Bearer ${token}` })
                .expect(403);
        });

        it('should return 500 if Authorization header is valid but an error occurs', async () => {
            const expectedError = new Error('OOPS');
            (getUserById as jest.Mock).mockImplementation(() => {
                throw expectedError;
            });

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .get('/user')
                .set({ Authorization: `Bearer ${token}` })
                .expect(500, { error: 'Internal Server Error' });
            expect((getUserById as jest.Mock).mock.calls.length).toEqual(1);
            expect((getUserById as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
        });

        it('should return 200 with the user returned by service if Authorization header is valid', async () => {
            const expectedUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                understand_disclaimer: true,
                completed_registration: true,
                creation_date: new Date(),
                updated_date: new Date(),
                consent_date: new Date(),
                accepted_terms: true,
                deleted: false,
            };

            (getUserById as jest.Mock).mockImplementation(() => expectedUser);

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .get('/user')
                .set({ Authorization: `Bearer ${token}` })
                .expect(checkBody(expectedUser))
                .expect(200);

            expect((getUserById as jest.Mock).mock.calls.length).toEqual(1);
            expect((getUserById as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
        });
    });

    describe('POST /user', () => {
        const postUserBody = {
            consent_date: new Date(),
            understand_disclaimer: true,
            accepted_terms: true,
        };

        beforeEach(() => {
            (createUser as jest.Mock).mockReset();
        });

        it('should return 403 if no Authorization header', async () =>
            request(app).post('/user').send(postUserBody).set('Content-type', 'application/json').expect(403));

        it('should return 403 if Authorization header contain expired token', async () => {
            const token = getToken(-1000);
            await request(app)
                .post('/user')
                .send(postUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(403);
        });

        it('should return 500 if Authorization header is valid but an error occurs', async () => {
            const expectedError = new Error('OOPS');
            (createUser as jest.Mock).mockImplementation(() => {
                throw expectedError;
            });

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .post('/user')
                .send(postUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(500, { error: 'Internal Server Error' });
            expect((createUser as jest.Mock).mock.calls.length).toEqual(1);
            expect((createUser as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
            expect((createUser as jest.Mock).mock.calls[0][1]['consent_date']).toEqual(
                postUserBody.consent_date.toISOString(),
            );
            expect((createUser as jest.Mock).mock.calls[0][1]['understand_disclaimer']).toEqual(
                postUserBody.understand_disclaimer,
            );
        });

        it('should return 200 with the user returned by service if Authorization header is valid', async () => {
            const expectedUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                understand_disclaimer: postUserBody.understand_disclaimer,
                completed_registration: true,
                creation_date: new Date(),
                updated_date: new Date(),
                consent_date: postUserBody.consent_date,
                accepted_terms: postUserBody.accepted_terms,
                deleted: false,
            };

            (createUser as jest.Mock).mockImplementation(() => expectedUser);

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .post('/user')
                .send(postUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(checkBody(expectedUser))
                .expect(201);

            expect((createUser as jest.Mock).mock.calls.length).toEqual(1);
            expect((createUser as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
            expect((createUser as jest.Mock).mock.calls[0][1]['consent_date']).toEqual(
                postUserBody.consent_date.toISOString(),
            );
            expect((createUser as jest.Mock).mock.calls[0][1]['understand_disclaimer']).toEqual(
                postUserBody.understand_disclaimer,
            );
        });
    });

    describe('PUT /user', () => {
        const putUserBody = {
            consent_date: new Date(),
            understand_disclaimer: true,
            accepted_terms: true,
        };

        beforeEach(() => {
            (updateUser as jest.Mock).mockReset();
        });

        it('should return 403 if no Authorization header', async () =>
            request(app).put('/user').send(putUserBody).set('Content-type', 'application/json').expect(403));

        it('should return 403 if Authorization header contain expired token', async () => {
            const token = getToken(-1000);
            await request(app)
                .put('/user')
                .send(putUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(403);
        });

        it('should return 500 if Authorization header is valid but an error occurs', async () => {
            const expectedError = new Error('OOPS');
            (updateUser as jest.Mock).mockImplementation(() => {
                throw expectedError;
            });

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .put('/user')
                .send(putUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(500, { error: 'Internal Server Error' });
            expect((updateUser as jest.Mock).mock.calls.length).toEqual(1);
            expect((updateUser as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
            expect((updateUser as jest.Mock).mock.calls[0][1]['consent_date']).toEqual(
                putUserBody.consent_date.toISOString(),
            );
            expect((updateUser as jest.Mock).mock.calls[0][1]['understand_disclaimer']).toEqual(
                putUserBody.understand_disclaimer,
            );
        });

        it('should return 200 with the user returned by service if Authorization header is valid', async () => {
            const expectedUser: IUserInput = {
                id: 123,
                keycloak_id: 'keycloak_id',
                understand_disclaimer: putUserBody.understand_disclaimer,
                completed_registration: true,
                creation_date: new Date(),
                updated_date: new Date(),
                consent_date: putUserBody.consent_date,
                accepted_terms: putUserBody.accepted_terms,
                deleted: false,
            };

            (updateUser as jest.Mock).mockImplementation(() => expectedUser);

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .put('/user')
                .send(putUserBody)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(checkBody(expectedUser))
                .expect(200);

            expect((updateUser as jest.Mock).mock.calls.length).toEqual(1);
            expect((updateUser as jest.Mock).mock.calls[0][0]).toEqual('keycloak_id');
            expect((updateUser as jest.Mock).mock.calls[0][1]['consent_date']).toEqual(
                putUserBody.consent_date.toISOString(),
            );
            expect((updateUser as jest.Mock).mock.calls[0][1]['understand_disclaimer']).toEqual(
                putUserBody.understand_disclaimer,
            );
        });
    });

    describe('POST /user-sets/aliases', () => {
        const payload = {
            setIds: [
                'AA33511e8d-02e1-40d9-97ad-589eb7d80fbd', // bad input (not uuid) on purpose
                '459b87ae-1910-4b52-bfcb-bb50062f40db',
                'f2ba2794-b486-4169-b91b-7e10a932f0e7',
            ],
        };

        beforeEach(() => {
            (getByIds as jest.Mock).mockReset();
        });

        it('should return 200 when the payload is valid', async () => {
            (getByIds as jest.Mock).mockImplementation(() => [
                {
                    id: '459b87ae-1910-4b52-bfcb-bb50062f40db',
                    alias: 'Cypress_B',
                },
                {
                    id: 'f2ba2794-b486-4169-b91b-7e10a932f0e7',
                    alias: 'Q1 union Q2 - 1165',
                },
            ]);

            const token = getToken(1000, 'keycloak_id');
            const result = await request(app)
                .post('/user-sets/aliases')
                .send(payload)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(200);

            expect(
                result.body.map((x) => x.setId.replace('set_id:', '')).every((x) => payload.setIds.includes(x)),
            ).toBe(true);
            expect(result.body.length).toEqual(payload.setIds.length - 1);
            expect((getByIds as jest.Mock).mock.calls.length).toEqual(1);
        });
    });

    // Not mocked: the uuid guard rejects before any database call, so this covers the real dal. SJIP-1600.
    describe('GET /saved-filters/withQueryId/:id', () => {
        it('should return 403 if no Authorization header', async () =>
            request(app).get('/saved-filters/withQueryId/0a1292c2-0bab-4190-a8d1-6db6e125af8a').expect(403));

        it('should answer 400 rather than leave the request hanging when the id is not a uuid', async () => {
            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .get('/saved-filters/withQueryId/not-a-uuid')
                .set({ Authorization: `Bearer ${token}` })
                .expect(400, { error: 'A saved filter query id must be a valid UUID.' });
        });
    });

    // Spies rather than jest.mock: the withQueryId test above needs the real dal guard.
    describe('DELETE /saved-filters/:id', () => {
        const id = '7f3a9c21-4b6d-4e35-9a17-2c8be5d40f11';
        let destroySpy: jest.SpyInstance;
        let filtersUsingQuerySpy: jest.SpyInstance;

        const deleteFilter = (path: string) =>
            request(app)
                .delete(path)
                .set({ Authorization: `Bearer ${getToken(1000, 'keycloak_id')}` });

        beforeEach(() => {
            destroySpy = jest.spyOn(savedFilterDal, 'destroy');
            destroySpy.mockResolvedValue(true);
            filtersUsingQuerySpy = jest.spyOn(savedFilterDal, 'getFiltersUsingQuery');
            filtersUsingQuerySpy.mockResolvedValue([]);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should strip the deleted query out of the filters using it when type=query', async () => {
            await deleteFilter(`/saved-filters/${id}?type=query`).expect(200);

            expect(filtersUsingQuerySpy).toHaveBeenCalledWith(id, 'keycloak_id');
        });

        it('should leave other filters alone without the type parameter', async () => {
            await deleteFilter(`/saved-filters/${id}`).expect(200);

            expect(filtersUsingQuerySpy).not.toHaveBeenCalled();
        });
    });

    describe('PUT /newsletter/subscribe', () => {
        const send = (body: object) =>
            request(app)
                .put('/newsletter/subscribe')
                .set({ Authorization: `Bearer ${getToken()}` })
                .send(body);

        beforeEach(() => {
            (subscribeNewsletter as jest.Mock).mockReset();
        });

        // The value reaches the Mailchimp URL path, so a non-email must not get that far.
        it('should return 400 and not call the dal when the email is a path traversal', async () => {
            await send({ newsletter_email: '../../../lists/OTHER-LIST/members/victim@example.org' }).expect(400);

            expect(subscribeNewsletter).not.toHaveBeenCalled();
        });

        it('should return 400 when the email is missing', async () => {
            await send({}).expect(400);

            expect(subscribeNewsletter).not.toHaveBeenCalled();
        });

        it('should pass a valid email through', async () => {
            (subscribeNewsletter as jest.Mock).mockResolvedValue({ newsletter_email: 'jane@example.org' });

            await send({ newsletter_email: 'jane@example.org' }).expect(200);

            expect(subscribeNewsletter).toHaveBeenCalledWith('12345-678-90abcdef', 'jane@example.org');
        });
    });

    describe('request body sanitisation', () => {
        const sqon = {
            op: 'and',
            content: [
                { op: '>=', content: { field: 'age_at_diagnosis', value: [5] } },
                { op: '<=', content: { field: 'age_at_diagnosis', value: [10] } },
            ],
        };

        const token = () => getToken(1000, 'keycloak_id');

        beforeEach(() => {
            (createUserSet as jest.Mock).mockReset();
            (createUserSet as jest.Mock).mockImplementation((_keycloak_id, payload) => payload);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should strip markup out of the body before it reaches the route', async () => {
            await request(app)
                .post('/user-sets')
                .send({ alias: '<img src=x onerror=alert(1)>Cohort', content: {} })
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token()}` })
                .expect(201);

            expect((createUserSet as jest.Mock).mock.calls[0][1].alias).toEqual('Cohort');
        });

        it('should leave the sqon in a user set content untouched', async () => {
            await request(app)
                .post('/user-sets')
                .send({ alias: 'Cohort', content: sqon })
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token()}` })
                .expect(201);

            expect((createUserSet as jest.Mock).mock.calls[0][1].content).toEqual(sqon);
        });

        it('should leave the sqon in saved filter queries untouched', async () => {
            const createSpy = jest.spyOn(savedFilterDal, 'create');
            createSpy.mockImplementation(async (_keycloak_id, payload) => payload);

            await request(app)
                .post('/saved-filters')
                .send({ title: 'Age range', queries: [sqon] })
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token()}` })
                .expect(201);

            expect(createSpy.mock.calls[0][1].queries).toEqual([sqon]);
        });
    });
});
