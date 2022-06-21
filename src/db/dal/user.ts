import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

import { validateUserRegistrationPayload } from '../../utils/userValidator';
import UserModel, { IUserInput, IUserOuput } from '../models/User';

const sanitizeInputPayload = (payload: IUserInput) => ({
    ...payload,
    id: undefined,
    keycloak_id: undefined,
    completed_registration: undefined,
    creation_date: undefined,
});

export const searchUsers = async (pageSize: number, pageIndex: number) => {
    const results = await UserModel.findAndCountAll({
        limit: pageSize,
        offset: pageIndex * pageSize,
        order: [['updated_date', 'DESC']],
        where: {
            completed_registration: true,
        },
    });

    return {
        users: results.rows,
        total: results.count,
    };
};

export const getUserById = async (keycloak_id: string): Promise<IUserOuput> => {
    const user = await UserModel.findOne({
        where: {
            keycloak_id,
        },
    });

    if (!user) {
        throw createHttpError(StatusCodes.NOT_FOUND, `User with keycloak id ${keycloak_id} does not exist.`);
    }

    return user;
};

export const isUserExists = async (
    keycloak_id: string,
): Promise<{
    exists: boolean;
}> => {
    const user = await UserModel.findOne({
        where: {
            keycloak_id,
        },
    });

    return {
        exists: !!user && (user?.completed_registration || false),
    };
};

export const createUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    const newUser = await UserModel.create({
        ...payload,
        keycloak_id: keycloak_id,
        creation_date: new Date(),
        updated_date: new Date(),
    });
    return newUser;
};

export const updateUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    const results = await UserModel.update(
        {
            ...sanitizeInputPayload(payload),
            updated_date: new Date(),
        },
        {
            where: {
                keycloak_id,
            },
            returning: true,
        },
    );

    return results[1][0];
};

export const completeRegistration = async (keycloak_id: string, payload: IUserInput): Promise<IUserOuput> => {
    if (!validateUserRegistrationPayload(payload)) {
        throw createHttpError(
            StatusCodes.BAD_REQUEST,
            'Some required fields are missing to complete user registration',
        );
    }

    const results = await UserModel.update(
        {
            ...sanitizeInputPayload(payload),
            completed_registration: true,
            updated_date: new Date(),
        },
        {
            where: {
                keycloak_id,
            },
            returning: true,
        },
    );

    return results[1][0];
};
