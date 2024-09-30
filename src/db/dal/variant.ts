import { literal, Op } from 'sequelize';
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
    const flagsWhere = [];
    flags.forEach(f => {
        if (f !== MISSING) {
            flagsWhere.push({
                properties: {
                    [Op.contains]: {
                        flags: [f]
                    }
                }
            });
        }
    });

    return await VariantModel.findAll({
        attributes: ['unique_id', 'timestamp', 'properties', [literal('(RANK() OVER(PARTITION BY unique_id ORDER BY timestamp DESC))'), 'rnk']],
        where: {
            [Op.or]: flagsWhere,
            organization_id: {
                [Op.in]: organizationIds
            },
        }
    });
}