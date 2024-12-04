import { Op } from 'sequelize';

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

    return await VariantModel.create({
        unique_id: uniqueId,
        organization_id: organizationId,
        author_id: authorId,
        properties: combinedProperties,
        timestamp: new Date(),
    });
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
    organizationIds: string[],
    uniqueIdParam: string
) {
    const uniqueIdWhere = uniqueIdParam.length > 0 ? ` AND unique_id LIKE '%${uniqueIdParam}%'` : '';

    const result = await VariantModel.sequelize.query(`
        SELECT unique_id, timestamp, properties, rnk
        FROM (
          SELECT
            unique_id,
            timestamp,
            properties,
            RANK() OVER (PARTITION BY unique_id ORDER BY timestamp DESC) AS rnk
          FROM variants
          WHERE organization_id IN ('${organizationIds.join("', '")}') ${uniqueIdWhere}
        ) s
        WHERE rnk = 1 AND (${whereClause});`);

    return result;
}

export const getEntriesByPropertiesFlags = async function (
    flags: string[],
    organizationIds: string[],
    uniqueIdParam: string
) {
    const flagsWhere = flags.map((f) => `properties @> '{"flags": ["${f}"]}'`);

    return await getEntriesByProperties(flagsWhere.join(' OR '), organizationIds, uniqueIdParam);
};

export const getEntriesByPropertiesNote = async function (
    hasNote: boolean,
    organizationIds: string[],
    uniqueIdParam: string
) {
    const notesWhere = `properties ->> 'note' IS ${hasNote ? 'NOT NULL' : 'NULL'}`;

    return await getEntriesByProperties(notesWhere, organizationIds, uniqueIdParam);
}
