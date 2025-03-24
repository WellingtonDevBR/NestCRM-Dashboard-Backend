import { CustomerRepository } from "../../domain/repositories/customerRepository";
import { Customer } from "../../domain/types/customer";

export class CustomerUseCase {
    constructor(private repository: CustomerRepository) { }

    async saveCustomer(subdomain: string, customer: Customer): Promise<void> {
        await this.repository.saveCustomer(subdomain, customer);
    }

    async getCustomers(subdomain: string): Promise<Customer[]> {
        return await this.repository.getCustomers(subdomain);
    }
}