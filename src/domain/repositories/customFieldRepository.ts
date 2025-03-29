import { CustomField, FieldCategory } from "../types/customFields";

export interface CustomFieldRepository {
    saveFields(
        tenantId: string,
        fields: CustomField[],
        category: FieldCategory,
    ): Promise<void>;

    getFields(tenantId: string, category: FieldCategory): Promise<CustomField[]>;
    getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<string, CustomField[]>>;
    savePredictionMapping(tenantId: string, mapping: Record<string, string>): Promise<void>;
    getMappedFields(tenantId: string): Promise<Record<string, string>>;
    getCustomerData(tenantId: string): Promise<Record<string, any>[]>;
}
