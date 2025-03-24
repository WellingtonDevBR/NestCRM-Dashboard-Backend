import { Customer } from "../types/customer";

export interface CustomerRepository {
    saveCustomer(subdomain: string, customer: Customer): Promise<void>;
    getCustomers(subdomain: string): Promise<Customer[]>;
}