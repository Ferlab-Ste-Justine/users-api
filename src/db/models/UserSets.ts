import { DataTypes, Model } from 'sequelize';

import { SET_FILTER_NAME_REGEX, UUID_VERSION } from '../../utils/constants';
import sequelizeConnection from '../config';

interface IUserSetAttributes {
    id: string;
    keycloak_id: string;
    content: any;
    alias: string;
    is_phantom_manifest: boolean;
    creation_date: Date;
    updated_date: Date;
    is_invisible: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserSetsInput extends IUserSetAttributes {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserSetsOutput extends IUserSetAttributes {}

class UserSetModel extends Model<IUserSetAttributes, IUserSetsInput> implements IUserSetAttributes {
    public id: string;
    public keycloak_id: string;
    public content: any;
    public alias: string;
    public is_phantom_manifest: boolean;
    public creation_date: Date;
    public updated_date: Date;
    public is_invisible: boolean;
}

UserSetModel.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            validate: {
                isUUID: UUID_VERSION,
            },
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUUID: UUID_VERSION,
            },
        },
        alias: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: SET_FILTER_NAME_REGEX,
            },
        },
        is_phantom_manifest: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
        content: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
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
        is_invisible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                isBoolean: true,
            },
        },
    },
    { sequelize: sequelizeConnection, modelName: 'user_sets', timestamps: false },
);

export default UserSetModel;
