import { SupportRepository } from "../../domain/repositories/supportRepository";
import { Support } from "../../domain/types/support";

export class SupportUseCase {
    constructor(private repository: SupportRepository) { }

    async saveSupport(subdomain: string, payload: Support): Promise<void> {
        const { associations, customFields } = payload;

        if (!associations?.customer_id && !associations?.email) {
            throw new Error("You must provide at least customer_id or email for association");
        }

        const support: Support = {
            customFields: customFields || {},
            associations
        };

        await this.repository.saveSupport(subdomain, support);
    }

    async getSupports(subdomain: string): Promise<Support[]> {
        return await this.repository.getSupports(subdomain);
    }
}
