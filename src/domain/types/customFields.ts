export type FieldCategory = 'Customer' | 'Order' | 'Payment' | 'Interaction';

export type CustomField = {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
    category: FieldCategory; // 👈 NEW
};
