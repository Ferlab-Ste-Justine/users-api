import { BindOrReplacements, Op, QueryTypes } from 'sequelize';

import VariantModel from '../models/Variant';

export const addNewEntry = async function (
    uniqueId: string,
    organizationId: string,
    authorId: string,
    properties: any,
) {
    const variantFound = await VariantModel.findOne({
        order: [['timestamp', 'DESC']],
        where: {
            unique_id: {
                [Op.eq]: uniqueId,
            },
            organization_id: {
                [Op.eq]: organizationId,
            },
        },
    });

    const combinedProperties = { ...(variantFound?.properties || {}), ...properties };

    if (Object.keys(properties).indexOf('flags') === -1 && variantFound) {
        return await variantFound.update({ properties: combinedProperties });
    } else {
        return await VariantModel.create({
            unique_id: uniqueId,
            organization_id: organizationId,
            author_id: authorId,
            properties: combinedProperties,
            timestamp: new Date(),
        });
    }
};

export const getEntriesByUniqueIdsAndOrganizations = async function (uniqueIds: string[], organizationIds: string[]) {
    return await VariantModel.findAll({
        order: [['timestamp', 'DESC']],
        where: {
            unique_id: {
                [Op.in]: uniqueIds,
            },
            organization_id: {
                [Op.in]: organizationIds,
            },
        },
    });
};

const getEntriesByProperties = async function (
    whereClause: string,
    uniqueIdParam: string,
    bindObject: BindOrReplacements
) {
    let uniqueIdWhere = '';

    if (uniqueIdParam?.length > 0) {
        uniqueIdWhere = `AND unique_id LIKE $uniqueIdParam`;

        bindObject["uniqueIdParam"] = `%${uniqueIdParam}%`;
    }

    const result = await VariantModel.sequelize.query(`
        SELECT unique_id, timestamp, properties, rnk
        FROM (
          SELECT
            unique_id,
            timestamp,
            properties,
            RANK() OVER (PARTITION BY unique_id ORDER BY timestamp DESC) AS rnk
          FROM variants
          WHERE organization_id = ANY($organizationIds) ${uniqueIdWhere}
        ) s
        WHERE rnk = 1 AND (${whereClause});`,
        {
            type: QueryTypes.SELECT,
            bind: bindObject,
            raw: true
        });

    return result;
}

export const getEntriesByPropertiesFlags = async function (
    flags: string[],
    organizationIds: string[],
    uniqueIdParam: string
) {
    const flagsWhere = [];

    const bindObject = {
        "organizationIds": organizationIds
    };

    flags.forEach((f, index) => {
        const flagsWhereBindKey = `flagsWhere${index}`;

        flagsWhere.push(`properties @> $${flagsWhereBindKey}`);
        bindObject[flagsWhereBindKey] = `{"flags": ["${f}"]}`;
    });

    return await getEntriesByProperties(flagsWhere.join(' OR '), uniqueIdParam, bindObject);
};

export const getEntriesByPropertiesNote = async function (
    hasNote: boolean,
    organizationIds: string[],
    uniqueIdParam: string
) {
    const notesWhere = `properties ->> 'note' IS ${hasNote ? 'NOT NULL' : 'NULL'}`;

    const bindObject = {
        "organizationIds": organizationIds
    };

    return await getEntriesByProperties(notesWhere, uniqueIdParam, bindObject);
}
