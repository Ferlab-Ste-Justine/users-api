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

export const getEntriesByProperties = async function (prop: object, organizationIds: string[]) {
    return await VariantModel.findAll({
        attributes: ['unique_id'],
        group: ['unique_id'],
        where: {
            properties: {
                [Op.contains]: prop
            },
            organization_id: {
                [Op.in]: organizationIds
            }
        }
    });
}