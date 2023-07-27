import { DataTypes, Model } from 'sequelize';
import validator from 'validator';

import typeValidators from '../../typeValidators';
import sequelizeConnection from '../config';

interface IUserAttributes {
    id: number;
    keycloak_id: string;
    first_name?: string;
    last_name?: string;
    era_commons_id?: string;
    nih_ned_id?: string;
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
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserInput extends IUserAttributes {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserOuput extends IUserAttributes {}

class UserModel extends Model<IUserAttributes, IUserInput> implements IUserAttributes {
    public id!: number;
    public keycloak_id!: string;
    public commercial_use_reason: string;
    public accepted_terms: boolean;
    public understand_disclaimer: boolean;
    public completed_registration: boolean;
    public creation_date!: Date;
    public updated_date!: Date;
    public deleted: boolean;
    public roles: string[];
    public portal_usages: string[];
}

UserModel.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            ...typeValidators.NUMBER,
        },
        keycloak_id: typeValidators.UUID,
        deleted: {
            defaultValue: false,
            ...typeValidators.BOOLEAN,
        },
        first_name: {
            ...typeValidators.TEXT,
            type: DataTypes.CITEXT,
        },
        last_name: {
            ...typeValidators.TEXT,
            type: DataTypes.CITEXT,
        },
        era_commons_id: typeValidators.STRING,
        nih_ned_id: typeValidators.STRING,
        commercial_use_reason: typeValidators.STRING,
        email: typeValidators.EMAIL,
        external_individual_fullname: typeValidators.STRING,
        external_individual_email: typeValidators.EMAIL,
        roles: DataTypes.ARRAY(typeValidators.STRING),
        affiliation: {
            ...typeValidators.TEXT,
            type: DataTypes.CITEXT,
        },
        public_email: typeValidators.EMAIL,
        linkedin: typeValidators.URL,
        portal_usages: DataTypes.ARRAY(DataTypes.CITEXT),
        research_domains: DataTypes.ARRAY(DataTypes.CITEXT),
        research_area_description: typeValidators.TEXT,
        profile_image_key: typeValidators.TEXT,
        creation_date: {
            ...typeValidators.DATE,
            defaultValue: new Date(),
        },
        updated_date: {
            ...typeValidators.DATE,
            defaultValue: new Date(),
        },
        consent_date: typeValidators.DATE,
        accepted_terms: {
            ...typeValidators.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        understand_disclaimer: {
            ...typeValidators.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        completed_registration: {
            ...typeValidators.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        config: {
            ...typeValidators.JSON,
            allowNull: false,
            defaultValue: {},
        },
    },
    {
        sequelize: sequelizeConnection,
        modelName: 'users',
        timestamps: false,
    },
);

export default UserModel;
