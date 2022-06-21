import { DataTypes, Model } from 'sequelize';

import sequelizeConnection from '../config';

interface ISavedFilterAttributes {
    id: number;
    keycloak_id: string;
    title: string;
    tag: string;
    queries: any[];
    favorite: boolean;
    creation_date: Date;
    updated_date: Date;
}

export type ISavedFilterInput = ISavedFilterAttributes;
export type ISavedFilterOutput = ISavedFilterAttributes;

class SavedFilterModel extends Model<ISavedFilterAttributes, ISavedFilterInput> implements ISavedFilterAttributes {
    public id!: number;
    public keycloak_id!: string;
    public title!: string;
    public tag!: string;
    public queries!: any[];
    public creation_date!: Date;
    public updated_date!: Date;
    public favorite!: boolean;
}

SavedFilterModel.init(
    {
        id: {
            type: DataTypes.NUMBER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: DataTypes.TEXT,
        tag: DataTypes.TEXT,
        favorite: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        queries: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: false,
            defaultValue: [],
        },
        creation_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
        updated_date: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
        },
    },
    { sequelize: sequelizeConnection, modelName: 'saved_filters', timestamps: false },
);

export default SavedFilterModel;
