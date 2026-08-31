import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op, QueryTypes } from 'sequelize';
import { v4 as uuid, validate as validateUuid } from 'uuid';

import sequelizeConnection from '../config';
import SavedFilterModel, { ISavedFilterInput, ISavedFilterOutput } from '../models/SavedFilter';

const sanitizeInputPayload = (payload: ISavedFilterInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, keycloak_id, creation_date, ...rest } = payload;
    return rest;
};

export const getById = async (id: string): Promise<ISavedFilterOutput> => {
    const filter = await SavedFilterModel.findOne({
        where: {
            id,
        },
    }).then((res) => res.get({ plain: true }));

    if (!filter) {
        throw createHttpError(StatusCodes.NOT_FOUND, `Saved filter #${id} does not exist.`);
    }

    return filter;
};

export const getAll = async ({
    keycloak_id,
    tag,
    type = 'filter',
}: {
    keycloak_id: string;
    tag?: string;
    type?: string;
}): Promise<ISavedFilterOutput[]> => {
    const options = {
        where: tag ? { [Op.and]: [{ keycloak_id }, { tag }, { type }] } : [{ keycloak_id }, { type }],
    };
    return SavedFilterModel.findAll(options);
};

export const create = async (keycloak_id: string, payload: ISavedFilterInput): Promise<ISavedFilterOutput> =>
    await SavedFilterModel.create({
        ...payload,
        keycloak_id,
        creation_date: new Date(),
        updated_date: new Date(),
    });

export const update = async (
    keycloak_id: string,
    id: string,
    payload: ISavedFilterInput,
): Promise<ISavedFilterOutput> => {
    const results = await SavedFilterModel.update(
        {
            ...sanitizeInputPayload(payload),
            updated_date: new Date(),
        },
        {
            where: {
                [Op.and]: [{ keycloak_id }, { id }],
            },
            returning: true,
            individualHooks: true,
        },
    );

    return results[1][0];
};

export const updateAsDefault = async (
    keycloak_id: string,
    id: string,
    payload: ISavedFilterInput,
): Promise<ISavedFilterOutput> => {
    const { tag } = payload;
    await SavedFilterModel.update(
        {
            favorite: false,
        },
        {
            where: {
                [Op.and]: [{ keycloak_id }, { tag }],
            },
            returning: false,
        },
    );
    const results = await SavedFilterModel.update(
        {
            favorite: true,
        },
        {
            where: {
                [Op.and]: [{ keycloak_id }, { id }],
            },
            returning: true,
        },
    );

    return results[1][0];
};

export const destroy = async (keycloak_id: string, id: string): Promise<boolean> => {
    const deletedCount = await SavedFilterModel.destroy({
        where: { [Op.and]: [{ keycloak_id }, { id }] },
    });
    return !!deletedCount;
};

export const getFiltersUsingQuery = async (queryID: string, keycloak_id: string): Promise<ISavedFilterOutput[]> => {
    if (!validateUuid(queryID)) {
        throw createHttpError(StatusCodes.BAD_REQUEST, 'A saved filter query id must be a valid UUID.');
    }

    // strpos, not `~`: the match has to stay literal, a regex would still accept metacharacters.
    const rows = await sequelizeConnection.query<ISavedFilterOutput & { queriestext?: string }>(
        `with queries
                  as (SELECT id, type, keycloak_id, queries, title, queries::JSONB[]::TEXT queriesText
                      from saved_filters)
         select *
         from queries
         where strpos(queriesText, $queryID) > 0
           and keycloak_id = $keycloak_id
           and type = 'filter';`,
        {
            bind: { queryID, keycloak_id },
            type: QueryTypes.SELECT,
        },
    );

    return rows.map((row) => {
        delete row.queriestext;
        return row;
    });
};

export const createQueriesAndUpdateBody = async (body, queries, keycloak_id) => {
    const newIds = [];
    const toCreate = structuredClone(queries)
        .filter((query) => query.keycloak_id !== keycloak_id)
        .map((query) => {
            const newID = uuid();
            newIds.push({ newID, oldID: query.id });
            query.id = newID;
            return query;
        });
    if (toCreate.length) {
        toCreate.forEach((query) => {
            create(keycloak_id, query);
        });
        let newContent = JSON.stringify(structuredClone(body));
        newIds.forEach(({ newID, oldID }) => {
            newContent = newContent.replace(oldID, newID);
        });
        return JSON.parse(newContent);
    } else {
        return body;
    }
};
