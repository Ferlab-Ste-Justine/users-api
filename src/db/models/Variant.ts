import { CreationOptional, DataTypes,  Model, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface IVariantAttributes {
    id: number;
    unique_id: string;
    author_id: string;
    organization_id: string;
    timestamp: Date;
    properties: Object;
}

type VariantCreationAttributes = Optional<IVariantAttributes, 'id'>;

class VariantModel extends Model<IVariantAttributes, VariantCreationAttributes> {
    declare id: CreationOptional<number>;
    declare unique_id: string;
    declare author_id: string;
    declare organization_id: string;
    declare timestamp: Date;
    declare properties: any;
}

VariantModel.init(
    {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            validate: {
                isInt: true,
            },
        },
        unique_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        organization_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            validate: {
                isDate: true,
            }
        },
        properties: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        }
    },
    {
        sequelize: sequelizeConnection,
        tableName: 'variants',
        timestamps: false
    }
);

export default VariantModel;