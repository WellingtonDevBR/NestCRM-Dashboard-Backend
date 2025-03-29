import { CustomField, FieldCategory } from "../types/customFields";
import { Associations } from "../types/associations";

export interface CustomFieldRepository {
    saveFields(
        tenantId: string,
        fields: CustomField[],
        category: FieldCategory,
        associations?: Associations
    ): Promise<void>;

    getFields(tenantId: string, category: FieldCategory): Promise<CustomField[]>;
    getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<string, CustomField[]>>;
    getMappedFields(tenantId: string): Promise<Record<string, string>>;
    getCustomerData(tenantId: string): Promise<Record<string, any>[]>;
}
