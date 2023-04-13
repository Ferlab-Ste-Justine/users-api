import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op } from 'sequelize';
import SavedFilterModel, { ISavedFilterInput, ISavedFilterOutput } from '../models/SavedFilter';

const sanitizeInputPayload = (payload: ISavedFilterInput) => {
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

export const getAll = async (keycloak_id: string, tag?: string): Promise<ISavedFilterOutput[]> => {
    const filters = await SavedFilterModel.findAll({
        where: tag ? { [Op.and]: [{ keycloak_id }, { tag }] } : { keycloak_id },
    });
    return filters;
};

export const create = async (keycloak_id: string, payload: ISavedFilterInput): Promise<ISavedFilterOutput> => {
    const filter = await SavedFilterModel.create({
        ...payload,
        keycloak_id,
        creation_date: new Date(),
        updated_date: new Date(),
    });
    return filter;
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
