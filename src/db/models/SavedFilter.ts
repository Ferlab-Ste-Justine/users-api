import { DataTypes, Model } from 'sequelize';

import { handleUniqueName } from '../../utils/savedFilters';
import sequelizeConnection from '../config';

interface ISavedFilterAttributes {
    id: string;
    keycloak_id: string;
    title: string;
    type: string;
    tag: string;
    queries: any[];
    favorite: boolean;
    creation_date: Date;
    updated_date: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISavedFilterInput extends ISavedFilterAttributes {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISavedFilterOutput extends ISavedFilterAttributes {}

class SavedFilterModel extends Model<ISavedFilterAttributes, ISavedFilterInput> implements ISavedFilterAttributes {
    public id!: string;
    public keycloak_id!: string;
    public title!: string;
    public tag!: string;
    public queries!: any[];
    public type!: string;
    public creation_date!: Date;
    public updated_date!: Date;
    public favorite!: boolean;
}

SavedFilterModel.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        keycloak_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: DataTypes.TEXT,
        tag: DataTypes.TEXT,
        type: DataTypes.ENUM('query', 'filter'),
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

SavedFilterModel.beforeCreate(handleUniqueName);

SavedFilterModel.beforeUpdate(handleUniqueName);

export default SavedFilterModel;
