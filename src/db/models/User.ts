import { DataTypes, Model } from 'sequelize';

import { LINKEDIN_REGEX, MAX_LENGTH_PER_ROLE, NAME_REGEX, UUID_VERSION } from '../../utils/constants';
import { SubscriptionStatus } from '../../utils/newsletter';
import sequelizeConnection from '../config';

interface IUserAttributes {
    id: number;
    keycloak_id: string;
    first_name?: string;
    last_name?: string;
    era_commons_id?: string;
    email?: string;
    linkedin?: string;
    public_email?: string;
    external_individual_fullname?: string;
    external_individual_email?: string;
    profile_image_key?: string;
    roles?: string[];
    affiliation?: string;
    portal_usages?: string[];
    research_domains?: string[];
    research_area_description?: string;
    creation_date: Date;
    updated_date: Date;
    consent_date?: Date;
    accepted_terms: boolean;
    understand_disclaimer: boolean;
    commercial_use_reason?: string;
    completed_registration: boolean;
    deleted: boolean;
    config?: any;
    locale?: string;
    newsletter_email?: string;
    newsletter_subscription_status?: SubscriptionStatus;
    newsletter_dataset_subscription_status?: SubscriptionStatus;
    location_country?: string;
    location_state?: string;
    website?: string;
    areas_of_interest?: string[];
    is_public?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserInput extends IUserAttributes {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserOutput extends IUserAttributes {}

class UserModel extends Model<IUserAttributes, IUserInput> implements IUserAttributes {
    public id: number;
    public keycloak_id: string;
    public commercial_use_reason: string;
    public accepted_terms: boolean;
    public understand_disclaimer: boolean;
    public completed_registration: boolean;
    public creation_date: Date;
    public updated_date: Date;
    public deleted: boolean;
    public roles: string[];
    public portal_usages: string[];
    public public_email?: string;
    public external_individual_email?: string;
    public linkedin?: string;
    public location_country?: string;
    public location_state?: string;
    public website?: string;
    public areas_of_interest?: string[];
    public is_public?: boolean;
}

UserModel.init(
    {
        id: {
            type: DataTypes.NUMBER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            validate: {
                isInt: true,
            },
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUUID: UUID_VERSION,
            },
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
        first_name: {
            type: DataTypes.CITEXT,
            validate: {
                len: [1, 70],
                is: NAME_REGEX,
            },
        },
        last_name: {
            type: DataTypes.CITEXT,
            validate: {
                len: [1, 70],
                is: NAME_REGEX,
            },
        },
        era_commons_id: {
            type: DataTypes.STRING,
        },
        commercial_use_reason: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                validate: (value: string) => value === '' || NAME_REGEX.test(value.trim()),
            },
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        external_individual_fullname: {
            type: DataTypes.TEXT,
            validate: {
                is: NAME_REGEX,
            },
        },
        external_individual_email: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isEmail: true },
        },
        roles: {
            type: DataTypes.ARRAY(DataTypes.CITEXT),
            validate: {
                validate: (roles: string[]) => {
                    const rolesOK = (roles ?? []).every(
                        (role) => NAME_REGEX.test(role) && role.length <= MAX_LENGTH_PER_ROLE,
                    );
                    if (!rolesOK) {
                        throw new Error('%s contains invalid values.');
                    }
                },
            },
        },
        affiliation: {
            type: DataTypes.CITEXT,
            allowNull: true,
            validate: {
                validate: (value: string) => value === '' || NAME_REGEX.test(value.trim()),
            },
        },
        public_email: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isEmail: true },
        },
        linkedin: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: true,
                is: LINKEDIN_REGEX,
            },
        },
        portal_usages: DataTypes.ARRAY(DataTypes.CITEXT),
        research_domains: DataTypes.ARRAY(DataTypes.CITEXT),
        research_area_description: DataTypes.TEXT,
        profile_image_key: DataTypes.TEXT,
        creation_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            validate: {
                isDate: true,
            },
        },
        updated_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            validate: {
                isDate: true,
            },
        },
        consent_date: DataTypes.DATE,
        accepted_terms: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
        understand_disclaimer: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
        completed_registration: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
        config: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
        locale: {
            type: DataTypes.ENUM('en', 'fr'),
            validate: {
                isAlpha: true,
            },
        },
        newsletter_email: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isEmail: true },
        },
        newsletter_subscription_status: {
            type: DataTypes.ENUM(
                SubscriptionStatus.SUBSCRIBED,
                SubscriptionStatus.UNSUBSCRIBED,
                SubscriptionStatus.FAILED,
            ),
            allowNull: true,
            validate: {
                isAlpha: true,
            },
        },
        newsletter_dataset_subscription_status: {
            type: DataTypes.ENUM(
                SubscriptionStatus.SUBSCRIBED,
                SubscriptionStatus.UNSUBSCRIBED,
                SubscriptionStatus.FAILED,
            ),
            allowNull: true,
            validate: {
                isAlpha: true,
            },
        },
        location_country: {
            type: DataTypes.CITEXT,
            allowNull: true,
            validate: {
                validate: (value: string) => value === '' || NAME_REGEX.test(value.trim()),
            },
        },
        location_state: {
            type: DataTypes.CITEXT,
            allowNull: true,
            validate: {
                validate: (value: string) => value === '' || NAME_REGEX.test(value.trim()),
            },
        },
        website: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isUrl: true },
        },
        areas_of_interest: DataTypes.ARRAY(DataTypes.CITEXT),
        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
    },
    {
        sequelize: sequelizeConnection,
        modelName: 'users',
        timestamps: false,
        hooks: {
            beforeValidate: (instance) => {
                instance.public_email = instance.public_email || null;
                instance.external_individual_email = instance.external_individual_email || null;
                instance.linkedin = instance.linkedin || null;
            },
        },
    },
);

export default UserModel;
