import { S3 } from '@aws-sdk/client-s3';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Op, Order } from 'sequelize';
import { uuid } from 'uuidv4';

import { keycloakRealm, profileImageBucket } from '../../config/env';
import config from '../../config/project';
import Realm from '../../config/realm';
import { UserValidator } from '../../utils/userValidator';
import UserModel, { IUserInput, IUserOutput } from '../models/User';

let S3Client;
try {
    S3Client = new S3({});
} catch (error) {
    console.warn('S3 client not initialized');
}

const sanitizeInputPayload = (payload: IUserInput) => {
    const {
        id,
        keycloak_id,
        completed_registration,
        creation_date,
        email,
        era_commons_id,
        newsletter_email,
        newsletter_subscription_status,
        newsletter_dataset_subscription_status,
        ...rest
    } = payload;

    return rest;
};

const createMatchClauses = (match: string) => {
    if (!match) return {};
    const matchLikeClause = { [Op.iLike]: `%${match}%` };
    return {
        [Op.or]: [{ first_name: matchLikeClause }, { last_name: matchLikeClause }, { affiliation: matchLikeClause }],
    };
};

// Legacy function to create AND clauses before createGroupedAndClauses was introduced. Left for reference and rollback
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

const createGroupedAndClauses = (
    filters: {
        filterName: string;
        filterArray: string[];
        filterOptions: string[];
    }[],
) => {
    const andClauses = [];

    for (const { filterName, filterArray, filterOptions } of filters) {
        if (!filterArray || filterArray.length === 0) continue;

        // Normalize values to lowercase and filter out falsy values
        const normalized = filterArray.filter(Boolean).map((v) => v.toLowerCase());

        // Prepare the list of "other" options (excluding the key itself)
        const otherValues =
            filterOptions?.filter((opt) => opt.toLowerCase() !== config.otherKey).map((v) => v.toLowerCase()) || [];

        // Build the OR group for the current filter
        const orGroup = [];

        // Add normal values (all except "other")
        for (const val of normalized) {
            if (val !== config.otherKey) {
                orGroup.push({
                    [filterName]: { [Op.contains]: [val] },
                });
            }
        }

        // Add "other" case as NOT contained (excluding known values)
        if (normalized.includes(config.otherKey) && otherValues.length > 0) {
            orGroup.push({
                [Op.not]: {
                    [filterName]: {
                        [Op.contained]: otherValues,
                    },
                },
            });
        }

        // Only push the OR clause if there is at least one condition
        if (orGroup.length > 0) {
            andClauses.push({ [Op.or]: orGroup });
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
    areasOfInterest,
}: {
    pageSize: number;
    pageIndex: number;
    sorts: Order;
    match: string;
    roles: string[];
    dataUses: string[];
    researchDomains: string[];
    areasOfInterest: string[];
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
        {
            filterArray: areasOfInterest,
            filterName: 'areas_of_interest',
            filterOptions: config.areaOfInterestOptions?.map((option) => option.value) || [],
        },
    ];
    const filterAndClauses = createGroupedAndClauses(filters);

    const results = await UserModel.findAndCountAll({
        attributes: config.cleanedUserAttributes,
        limit: pageSize,
        offset: pageIndex * pageSize,
        order: sorts,
        where: {
            [Op.and]: [
                {
                    completed_registration: true,
                    is_public: true,
                    deleted: false,
                },
                ...(matchClauses ? [matchClauses] : []),
                ...filterAndClauses,
            ],
        },
    });

    const allActiveUsersCount = await UserModel.count({
        where: {
            completed_registration: true,
            deleted: false,
        },
    });

    return {
        users: results.rows,
        total: results.count,
        allActiveUsersTotal: allActiveUsersCount,
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

export const getUserById = async (keycloak_id: string, isOwn: boolean): Promise<IUserOutput> => {
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

    return user.dataValues;
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

export const createUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOutput> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { newsletter_email, newsletter_subscription_status, is_public, ...rest } = payload;

    // KF is the only project that have public/private profiles
    const is_public_depending_on_project = keycloakRealm === Realm.KF ? false : true;

    const newUser = await UserModel.create({
        ...rest,
        keycloak_id: keycloak_id,
        is_public: is_public_depending_on_project,
        creation_date: new Date(),
        updated_date: new Date(),
    });

    return newUser.dataValues;
};

export const updateUser = async (keycloak_id: string, payload: IUserInput): Promise<IUserOutput> => {
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

    return results[1][0].dataValues;
};

export const deleteUser = async (keycloak_id: string): Promise<void> => {
    await UserModel.update(
        {
            keycloak_id: uuid(),
            email: null,
            affiliation: null,
            public_email: null,
            era_commons_id: null,
            first_name: null,
            last_name: null,
            linkedin: null,
            external_individual_fullname: null,
            external_individual_email: null,
            newsletter_email: null,
            newsletter_subscription_status: null,
            deleted: true,
            is_public: false,
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
): Promise<IUserOutput> => {
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

    return results[1][0].dataValues;
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

export const exportAllUsers = async (): Promise<UserModel[]> => await UserModel.findAll();
