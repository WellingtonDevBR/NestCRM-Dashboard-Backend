import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { CustomField, FieldCategory } from "../../domain/types/customFields";

export class CustomFieldUseCase {
    constructor(private repository: CustomFieldRepository) { }

    async saveFields(tenantId: string, fields: CustomField[], category: FieldCategory): Promise<void> {
        await this.repository.saveFields(tenantId, fields, category);
    }

    async getFields(tenantId: string, category: FieldCategory): Promise<CustomField[]> {
        return await this.repository.getFields(tenantId, category);
    }

    async getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<string, CustomField[]>> {
        return await this.repository.getAllFieldsGroupedByCategory(tenantId);
    }

}