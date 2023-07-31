import { DataTypes, Model } from 'sequelize';

import sequelizeConnection from '../config';

interface IUserSetAttributes {
    id: string;
    keycloak_id: string;
    content: any;
    alias: string;
    sharedpublicly: boolean;
    creation_date: Date;
    updated_date: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserSetsInput extends IUserSetAttributes {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserSetsOutput extends IUserSetAttributes {}

class UserSetModel extends Model<IUserSetAttributes, IUserSetsInput> implements IUserSetAttributes {
    public id!: string;
    public keycloak_id!: string;
    public content!: any;
    public alias!: string;
    public sharedpublicly!: boolean;
    public creation_date!: Date;
    public updated_date!: Date;
}

UserSetModel.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            validate: {
                isUUID: 4,
            },
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUUID: 4,
            },
        },
        alias: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isAlpha: true,
            },
        },
        sharedpublicly: {
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
            validate: {
                isJSON: true,
            },
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
    },
    { sequelize: sequelizeConnection, modelName: 'user_sets', timestamps: false },
);

export default UserSetModel;
