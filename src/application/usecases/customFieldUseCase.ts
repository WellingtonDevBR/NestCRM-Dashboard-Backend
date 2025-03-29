import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { CustomField, FieldCategory } from "../../domain/types/customFields";
import { Associations } from "../../domain/types/associations";
import { PredictionPayload } from "../../domain/types/predictionPayload";

export class CustomFieldUseCase {
    constructor(private repository: CustomFieldRepository) { }

    async saveFields(
        tenantId: string,
        payload: {
            fields: CustomField[],
            category: FieldCategory
        }
    ): Promise<void> {
        const { fields, category } = payload;

        if (!fields || !Array.isArray(fields)) {
            throw new Error("Invalid or missing fields array");
        }

        if (!category) {
            throw new Error("Category is required");
        }

        await this.repository.saveFields(tenantId, fields, category);
    }

    async getFields(tenantId: string, category: FieldCategory): Promise<CustomField[]> {
        return await this.repository.getFields(tenantId, category);
    }

    async savePredictionMapping(
        tenantId: string,
        mapping: Record<string, string>
    ): Promise<void> {
        if (!mapping || typeof mapping !== 'object') {
            throw new Error("Invalid prediction mapping object");
        }

        await this.repository.savePredictionMapping(tenantId, mapping);
    }


    async getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<string, CustomField[]>> {
        return await this.repository.getAllFieldsGroupedByCategory(tenantId);
    }

    async generatePayload(tenantId: string): Promise<PredictionPayload> {
        const fieldMapping = await this.repository.getMappedFields(tenantId);
        const rawData = await this.repository.getCustomerData(tenantId);

        const reverseMap = Object.entries(fieldMapping).reduce((acc, [modelField, tenantField]) => {
            acc[tenantField] = modelField;
            return acc;
        }, {} as Record<string, string>);

        const transformedData = rawData.map(record => {
            const transformed: Record<string, any> = {};
            Object.keys(record).forEach(key => {
                const mappedKey = reverseMap[key] || key;
                transformed[mappedKey] = record[key];
            });
            return transformed;
        });

        return {
            field_mapping: fieldMapping,
            data: transformedData
        };
    }
}
