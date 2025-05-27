import { Express } from 'express';
import Keycloak from 'keycloak-connect';
import request from 'supertest';

import { getToken, publicKey } from '../../test/authTestUtils';
import buildApp from '../app';
import { createUser, getUserById, updateUser } from '../db/dal/user';
import { getByIds } from '../db/dal/userSets';
import { IUserInput } from '../db/models/User';

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
});
