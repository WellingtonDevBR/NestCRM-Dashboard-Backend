import { InteractionRepository } from "../../domain/repositories/interactionRepository";
import { Interaction } from "../../domain/types/interaction";

export class InteractionUseCase {
    constructor(private repository: InteractionRepository) { }

    async saveInteraction(subdomain: string, payload: Interaction): Promise<void> {
        const { associations, customFields } = payload;

        if (!associations?.customer_id && !associations?.email) {
            throw new Error("You must provide at least customer_id or email for association");
        }

        const interaction: Interaction = {
            customFields: customFields || {},
            associations
        };

        await this.repository.saveInteraction(subdomain, interaction);
    }

    async getInteractions(subdomain: string): Promise<Interaction[]> {
        return await this.repository.getInteractions(subdomain);
    }
}
