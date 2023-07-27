import { type } from 'os';
import { DataTypes, Model } from 'sequelize';
import validator from 'validator';

import typeValidators from '../../typeValidators';
import sequelizeConnection from '../config';

const { escape } = validator;
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
        id: { ...typeValidators.UUID, primaryKey: true },
        keycloak_id: typeValidators.UUID,
        title: typeValidators.TEXT,
        type: DataTypes.ENUM('query', 'filter'),
        tag: typeValidators.STRING,
        queries: typeValidators.JSON_ARRAY,
        favorite: typeValidators.BOOLEAN,
        creation_date: typeValidators.DATE,
        updated_date: DataTypes.DATE, // TODO use our validator instead
    },
    {
        sequelize: sequelizeConnection,
        modelName: 'saved_filters',
        timestamps: false,
    },
);

export default SavedFilterModel;
