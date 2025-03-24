

export interface Customer {
    CustomerID: string;
    Name: string;
    Email?: string;
    Phone?: string;
    CreatedAt: string;
    CustomFields?: Record<string, any>; // Dynamic per tenant
}