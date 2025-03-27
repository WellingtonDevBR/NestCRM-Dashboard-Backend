import { MappingEntry, PredictionFieldMappingRepository } from "../../domain/repositories/predictionFieldMappingRepository";

export class PredictionFieldMappingUseCase {
    constructor(private repository: PredictionFieldMappingRepository) { }

    async saveMappings(tenantId: string, mappings: MappingEntry[]): Promise<void> {
        await this.repository.saveMappings(tenantId, mappings);
    }

    async getMappings(tenantId: string): Promise<MappingEntry[]> {
        return await this.repository.getMappings(tenantId);
    }
}

