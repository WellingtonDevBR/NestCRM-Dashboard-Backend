import { CustomField } from "../types/customFields";

export interface CustomFieldRepository {
    saveFields(tenantId: string, fields: CustomField[]): Promise<void>;
    getFields(tenantId: string): Promise<CustomField[]>;
}