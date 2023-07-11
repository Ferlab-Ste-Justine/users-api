import createHttpError from 'http-errors';
import {StatusCodes} from 'http-status-codes';
import {Op} from 'sequelize';

import sequelizeConnection from '../config';
import SavedFilterModel, {ISavedFilterInput, ISavedFilterOutput} from '../models/SavedFilter';

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
    });

    if (!filter) {
        throw createHttpError(StatusCodes.NOT_FOUND, `Saved filter #${id} does not exist.`);
    }

    return filter;
};

export const getAll = async ({ keycloak_id, tag, type = 'filter' }): Promise<ISavedFilterOutput[]> => {
    const options = {
        where: tag ? { [Op.and]: [{ keycloak_id }, { tag }, { type }] } : [{ keycloak_id }, { type }],
    };
    return await SavedFilterModel.findAll(options);
};

export const create = async (keycloak_id: string, payload: ISavedFilterInput): Promise<ISavedFilterOutput> => {
    return await SavedFilterModel.create({
        ...payload,
        keycloak_id,
        creation_date: new Date(),
        updated_date: new Date(),
    });
};

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

export const getFiltersUsingQuery = async (queryID: string) =>
    await sequelizeConnection
        .query(
            `with queries
                      as (SELECT id, type, queries, title, queries::JSONB[]::TEXT queriesText
                          from saved_filters)
             select *
             from queries
             where queriesText ~ '${queryID}';`,
        )
        .then((res: any) =>
            res[0].map((r) => {
                delete r.queriestext;
                return r;
            }),
        );
