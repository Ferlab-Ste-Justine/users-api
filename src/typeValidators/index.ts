import { DataTypes } from 'sequelize';
import validator from 'validator';
import escape = validator.escape;

export default {
    STRING: {
        type: DataTypes.STRING,
        validate: {
            isValid(value) {
                if (!validator.isAlpha(value, undefined, { ignore: '_' })) throw new Error('%s is not valid string');
            },
        },
    },
    NUMBER: {
        type: DataTypes.NUMBER,
        validate: {
            isValid(value) {
                if (!validator.isNumeric(value)) throw new Error('%s is not valid number');
            },
        },
    },
    UUID: {
        type: DataTypes.UUID,
        validate: {
            isValid(value) {
                if (!validator.isUUID(value, 4)) throw new Error('%s is not valid UUID');
            },
        },
    },
    TEXT: {
        type: DataTypes.TEXT,
        validate: {
            isValid(value) {
                if (!validator.isAlphanumeric(escape(value), 'fr-FR')) throw new Error('%s is not valid text');
            },
        },
    },
    BOOLEAN: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    JSON: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    JSON_ARRAY: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: false,
        defaultValue: {},
    },
    DATE: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
        validate: {
            isValid(value) {
                if (!validator.isDate(value)) throw new Error(`%s is not a valid date`);
            },
        },
    },
    EMAIL: {
        type: DataTypes.STRING,
        validate: {
            isValid(value) {
                if (!validator.isEmail(value)) throw new Error('%s is not a valid email');
            },
        },
    },
    URL: {
        type: DataTypes.STRING,
        validate: {
            isValid(value) {
                if (!validator.isURL(escape(value))) throw new Error('%s is not a valid url');
            },
        },
    },
};
