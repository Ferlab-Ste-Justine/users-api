import { col, fn, Op, where } from 'sequelize';
import VariantModel, { MISSING } from '../models/Variant';

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

export const getEntriesByPropertiesFlags = async function (flags: string[], organizationIds: string[]) {
    const flagsWhere = flags.map(f => {
        return f === MISSING ? `JSONB_ARRAY_LENGTH(properties -> 'flags') = 0` : `properties @> '{"flags": ["${f}"]}'`;
    });

    const result = await VariantModel.sequelize.query(`
        SELECT unique_id, timestamp, properties, rnk
        FROM (
          SELECT
            unique_id,
            timestamp,
            properties,
            RANK() OVER (PARTITION BY unique_id ORDER BY timestamp DESC) AS rnk
          FROM variants
          WHERE organization_id IN ('${organizationIds.join("', '")}')
        ) s
        WHERE rnk = 1 AND (${flagsWhere.join(' OR ')});`);

    return result;
}