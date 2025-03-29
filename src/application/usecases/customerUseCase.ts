import { CustomerRepository } from "../../domain/repositories/customerRepository";
import { Customer } from "../../domain/types/customer";
import { v4 as uuidv4 } from "uuid";

export class CustomerUseCase {
    constructor(private repository: CustomerRepository) { }

    async saveCustomer(subdomain: string, payload: Customer): Promise<void> {
        const { associations, customFields } = payload;

        if (!associations?.customer_id && !associations?.email) {
            throw new Error("You must provide at least customer_id or email for association");
        }

        if (!customFields || Object.keys(customFields).length === 0) {
            throw new Error("customFields cannot be empty");
        }

        const finalCustomerId = associations.customer_id || uuidv4();

        const customer: Customer & { CustomerID: string } = {
            customFields,
            associations: {
                customer_id: associations.customer_id ?? finalCustomerId,
                email: associations.email ?? null,
            },
            CustomerID: finalCustomerId
        };

        await this.repository.saveCustomer(subdomain, customer);
    }

    async getCustomers(subdomain: string): Promise<Customer[]> {
        return await this.repository.getCustomers(subdomain);
    }
}
