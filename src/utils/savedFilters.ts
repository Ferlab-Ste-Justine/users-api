import { StatusCodes } from 'http-status-codes';
import { QueryTypes } from 'sequelize';

import sequelizeConnection from '../db/config';
import { getById } from '../db/dal/savedFilter';

const removeFilterFromContent = (content, id) => {
    if (content)
        return content.map((obj) => {
            if (content.content) return removeFilterFromContent(obj.content, id);
            if (obj.filterID !== id) {
                return obj;
            }
        });
};

export const removeQueryFromFilters = (filters, id) => {
    // recursively remove the object that contains the key filterID and the id
    filters = filters.map((filter) => {
        filter.queries.map((query) => {
            query.content = removeFilterFromContent(query.content, id).filter((obj) => !!obj);
            return query;
        });
        return filter;
    });
    return filters;
};

export const getPillContent = async (filterID: string) => {
    const pill = await getById(filterID);
    return { query: pill.queries[0], title: pill.title, filterID };
};
const updateContent = async (content) => {
    if (content.filterID) {
        const { query, title } = await getPillContent(content.filterID);
        query.title = title;
        query.filterID = content.filterID;
        return query;
    }
    return content;
};
export const updateQuery = async (query) => {
    if (JSON.stringify(query).includes('filterID') && query.content) {
        query.content = await Promise.all(
            query.content.map((content) => {
                if (content.filterID) {
                    return updateContent(content);
                }
                return content;
            }),
        );
    }
    return query;
};

export const getFilterIDs = (json) => {
    const result = {};

    const traverse = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach((key) => {
                if (key === 'filterID' && !Object.keys(result).includes(obj[key])) {
                    result[obj[key]] = obj;
                } else {
                    traverse(obj[key]);
                }
            });
        }
    };

    traverse(json);
    return result;
};

export const errorHandler = (e, res) => {
    if (
        e.key === 'title.not_unique' ||
        e.errors.some((err) => err.validatorKey === 'not_unique' && err.path === 'title')
    ) {
        const err = e.errors ? e.errors.find((err) => err.validatorKey === 'not_unique' && err.path === 'title') : e;
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
            error: {
                message: err.message,
                translationKey: `${err.instance.dataValues.type || 'filter'}.error.save.nameAlreadyExists`,
            },
        });
    }
};

export const handleUniqueName = async (filter) => {
    const count = await sequelizeConnection
        .query(
            'SELECT count(*) from saved_filters where keycloak_id = :keycloak_id and title = :title and type = :type',
            {
                replacements: { keycloak_id: filter.keycloak_id, title: filter.title, type: filter.type || 'filter' },
                type: QueryTypes.SELECT,
            },
        )
        .then((res) => res[0]['count'])
        .catch((err) => console.error('unable to to the hooks query', err));
    if (count > 0)
        throw {
            key: 'title.not_unique',
            message: `A ${filter.type || 'filter'} with this title already exists`,
        };
};
