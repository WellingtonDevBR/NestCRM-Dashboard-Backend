import { CustomFieldRepository } from "../../domain/repositories/CustomFieldRepository";
import { CustomField } from "../../domain/types/customFields";

export class CustomFieldUseCase {
    constructor(private repository: CustomFieldRepository) { }

    async saveFields(tenantId: string, fields: CustomField[]): Promise<void> {
        await this.repository.saveFields(tenantId, fields);
    }

    async getFields(tenantId: string): Promise<CustomField[]> {
        return await this.repository.getFields(tenantId);
    }
}