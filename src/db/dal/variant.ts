import { Op } from 'sequelize';
import VariantModel from '../models/Variant';

export const addNewEntry = async function (uniqueId: string, organizationId: string, authorId: string, properties: any) {
    return await VariantModel.create({
        unique_id: uniqueId,
        organization_id: organizationId,
        author_id: authorId,
        properties,
        timestamp: new Date()
    });
}

export const getEntriesByUniqueIdsAndOrganizations = async function (uniqueIds: string[], organizationIds: string[]) {
    return await VariantModel.findAll({
        order: [['timestamp', 'DESC']],
        where: {
            unique_id: {
                [Op.in]: uniqueIds
            },
            organization_id: {
                [Op.in]: organizationIds
            }
        }
    });
}

export const getEntriesByPropertiesFlags = async function (flags: string[], organizationIds: string[], uniqueIdParam: string) {
    const flagsWhere = flags.map(f => {
        return `properties @> '{"flags": ["${f}"]}'`;
    });

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
        WHERE rnk = 1 AND (${flagsWhere.join(' OR ')});`);

    return result;
}