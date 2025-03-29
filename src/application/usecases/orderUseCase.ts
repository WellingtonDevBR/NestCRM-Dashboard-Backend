import { OrderRepository } from "../../domain/repositories/orderRepository";
import { Order } from "../../domain/types/order";

export class OrderUseCase {
    constructor(private repository: OrderRepository) { }

    async save(subdomain: string, order: Order): Promise<void> {
        const { associations, customFields } = order;
        if (!associations?.customer_id && !associations?.email) {
            throw new Error("You must provide at least customer_id or email for association");
        }

        await this.repository.saveOrder(subdomain, {
            associations,
            customFields: customFields || {}
        });
    }

    async getAll(subdomain: string): Promise<Order[]> {
        return this.repository.getOrders(subdomain);
    }
}
