import { S3 } from '@aws-sdk/client-s3';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op, Order } from 'sequelize';
import { uuid } from 'uuidv4';

import { profileImageBucket } from '../../config/env';
import config from '../../config/project';
import { UserValidator } from '../../utils/userValidator';
import UserModel, { IUserInput, IUserOuput } from '../models/User';

let S3Client;
try {
    S3Client = new S3({});
} catch (error) {
    console.warn('S3 client not initialized');
}

const sanitizeInputPayload = (payload: IUserInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, keycloak_id, completed_registration, creation_date, email, era_commons_id, nih_ned_id, ...rest } =
        payload;
    return rest;
};

const createMatchClauses = (match: string) => {
    if (!match) return {};
    const matchLikeClause = { [Op.iLike]: `%${match}%` };
    return {
        [Op.or]: [{ first_name: matchLikeClause }, { last_name: matchLikeClause }, { affiliation: matchLikeClause }],
    };
};

const createAndClauses = (
    filters: {
        filterName: string;
        filterArray: string[];
        filterOptions: string[];
    }[],
) => {
    const andClauses = [];
    for (const filter of filters) {
        const filterWithoutOther = filter.filterArray.filter((item) => item.toLowerCase() !== config.otherKey);
        if (filterWithoutOther.length) {
            andClauses.push({
                [filter.filterName]: {
                    [Op.contains]: filterWithoutOther.filter((item) => item).map((item) => item.toLowerCase()),
                },
            });
        }
        if (filter.filterArray.includes(config.otherKey)) {
            andClauses.push({
                [Op.not]: { [filter.filterName]: { [Op.contained]: filter.filterOptions } },
            });
        }
    }
    return andClauses;
};

export const searchUsers = async ({
    pageSize,
    pageIndex,
    sorts,
    match,
    roles,
    dataUses,
    researchDomains,
}: {
    pageSize: number;
    pageIndex: number;
    sorts: Order;
    match: string;
    roles: string[];
    dataUses: string[];
    researchDomains: string[];
}) => {
    const matchClauses = createMatchClauses(match);
    const filters = [
        {
            filterArray: roles,
            filterName: 'roles',
            filterOptions: config.roleOptions.map((option) => option.value) || [],
        },
        {
            filterArray: dataUses,
            filterName: 'portal_usages',
            filterOptions: config.usageOptions?.map((option) => option.value) || [],
        },
        {
            filterArray: researchDomains,
            filterName: 'research_domains',
            filterOptions: config.researchDomainOptions?.map((option) => option.value) || [],
        },
    ];
    const andClauses = createAndClauses(filters);

    const results = await UserModel.findAndCountAll({
        attributes: config.cleanedUserAttributes,
        limit: pageSize,
        offset: pageIndex * pageSize,
        order: sorts,
        where: {
            [Op.and]: {
                completed_registration: true,
                deleted: false,
                ...matchClauses,
                [Op.and]: andClauses,
            },
        },
    });

    return {
        users: results.rows,
        total: results.count,
    };
};

export const getProfileImageUploadPresignedUrl = async (keycloak_id: string) => {
    if (!S3Client) {
        return {
            s3Key: undefined,
            presignUrl: undefined,
        };
    }

    const s3Key = `${keycloak_id}.${config.profileImageExtension}`;
    const presignUrl = S3Client.getSignedUrl('putObject', {
        Bucket: profileImageBucket,
        Key: s3Key,
        Expires: 60 * 5,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });

    return {
        s3Key,
        presignUrl,
    };
};

export const getUserById = async (keycloak_id: string, isOwn: boolean): Promise<IUserOuput> => {
    let attributesClause = {};
    if (!isOwn) {
        attributesClause = {
            attributes: config.cleanedUserAttributes,
        };
    }

    const user = await UserModel.findOne({
        ...attributesClause,
        where: {
            keycloak_id,
            deleted: false,
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

export const deleteUser = async (keycloak_id: string): Promise<void> => {
    await UserModel.update(
        {
            keycloak_id: uuid(),
            email: null,
            affiliation: null,
            public_email: null,
            nih_ned_id: null,
            era_commons_id: null,
            first_name: null,
            last_name: null,
            linkedin: null,
            external_individual_fullname: null,
            external_individual_email: null,
            deleted: true,
        },
        {
            where: {
                keycloak_id,
            },
        },
    );
};

export const completeRegistration = async (
    keycloak_id: string,
    payload: IUserInput,
    validator: UserValidator,
): Promise<IUserOuput> => {
    if (!validator(payload)) {
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

export const resetAllConsents = async (): Promise<number> => {
    const result = await UserModel.update(
        {
            accepted_terms: false,
            understand_disclaimer: false,
            consent_date: null,
            updated_date: new Date(),
        },
        {
            where: {},
            returning: true,
        },
    );

    return result[0];
};

export const retrieveUserCreatedSince = async (date: string): Promise<number> => {
    const result = await UserModel.count({
        where: {
            [Op.and]: {
                completed_registration: true,
                deleted: false,
                creation_date: {
                    [Op.gte]: new Date(date),
                },
            },
        },
    });
    return result;
};
