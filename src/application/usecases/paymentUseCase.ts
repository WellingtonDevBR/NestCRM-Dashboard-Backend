import { PaymentRepository } from "../../domain/repositories/paymentRepository";
import { Payment } from "../../domain/types/payment";

export class PaymentUseCase {
    constructor(private repository: PaymentRepository) { }

    async savePayment(subdomain: string, payload: Payment): Promise<void> {
        const { associations, customFields } = payload;

        if (!associations?.customer_id && !associations?.email) {
            throw new Error("You must provide at least customer_id or email for association");
        }

        const payment: Payment = {
            customFields: customFields || {},
            associations
        };

        await this.repository.savePayment(subdomain, payment);
    }

    async getPayments(subdomain: string): Promise<Payment[]> {
        return await this.repository.getPayments(subdomain);
    }
}
