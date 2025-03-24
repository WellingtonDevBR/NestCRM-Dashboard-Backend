export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export interface CustomField {
    key: string;
    label: string;
    type: CustomFieldType;
    required: boolean;
    options?: string[];
}