import { StatusCodes } from 'http-status-codes';

import sequelizeConnection from '../config';
import SavedFilterModel from '../models/SavedFilter';
import { createQueriesAndUpdateBody, getFiltersUsingQuery } from './savedFilter';

const QUERY_ID = '0a1292c2-0bab-4190-a8d1-6db6e125af8a';
const KEYCLOAK_ID = '3999fd60-80d2-477d-819e-93f6873efdb2';

// Breaks out of the AND chain, so the keycloak_id scoping stops applying. See SJIP-1600.
const EXPLOIT = ".*' or '1'='1";

describe('getFiltersUsingQuery', () => {
    let queryMock: jest.SpyInstance;

    // Asserts on what is sent, so the mocked return value is irrelevant.
    const send = (queryID: string) => getFiltersUsingQuery(queryID, KEYCLOAK_ID).catch(() => undefined);

    beforeEach(() => {
        queryMock = jest.spyOn(sequelizeConnection, 'query');
        queryMock.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('keeps the caller input out of the SQL text', async () => {
        await send(QUERY_ID);

        const [sql] = queryMock.mock.calls[0];
        expect(sql).not.toContain(QUERY_ID);
        expect(sql).not.toContain(KEYCLOAK_ID);
    });

    it('binds the query id and the keycloak id as parameters', async () => {
        await send(QUERY_ID);

        expect(queryMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ bind: { queryID: QUERY_ID, keycloak_id: KEYCLOAK_ID } }),
        );
    });

    it('matches the query id literally rather than as a regex', async () => {
        await send(QUERY_ID);

        const [sql] = queryMock.mock.calls[0];
        expect(sql).not.toContain('~');
    });

    it('rejects a query id that is not a uuid without querying the database', async () => {
        await expect(getFiltersUsingQuery(EXPLOIT, KEYCLOAK_ID)).rejects.toMatchObject({
            status: StatusCodes.BAD_REQUEST,
        });

        expect(queryMock).not.toHaveBeenCalled();
    });

    it('omits the internal queriestext column from its results', async () => {
        queryMock.mockResolvedValue([{ id: QUERY_ID, title: 'a filter', queriestext: `[{"id":"${QUERY_ID}"}]` }]);

        expect(await getFiltersUsingQuery(QUERY_ID, KEYCLOAK_ID)).toEqual([{ id: QUERY_ID, title: 'a filter' }]);
    });
});

describe('createQueriesAndUpdateBody', () => {
    const OTHER_QUERY_ID = '11111111-1111-4111-8111-111111111111';
    const otherUsersQuery = { id: OTHER_QUERY_ID, keycloak_id: 'someone-else', title: 'Cohort A', queries: [] };
    const body = { content: [{ filterID: OTHER_QUERY_ID }] };

    const copy = () => createQueriesAndUpdateBody(body, [otherUsersQuery], KEYCLOAK_ID);

    let createMock: jest.SpyInstance;

    beforeEach(() => {
        createMock = jest.spyOn(SavedFilterModel, 'create');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Unhandled here means process.exit(1), because the copy runs outside the route's try/catch.
    it('surfaces a failed copy to the caller instead of letting the rejection escape', async () => {
        // What the beforeCreate uniqueness hook throws when the title is already taken.
        createMock.mockRejectedValue({ key: 'title.not_unique' });

        await expect(copy()).rejects.toEqual({ key: 'title.not_unique' });
    });

    it('waits for the copies to finish before returning the rewritten body', async () => {
        let written = false;
        createMock.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => {
                        written = true;
                        resolve(undefined);
                    }, 0),
                ),
        );

        const result = await copy();

        expect(written).toBe(true);
        expect(JSON.stringify(result)).not.toContain(OTHER_QUERY_ID);
    });
});
