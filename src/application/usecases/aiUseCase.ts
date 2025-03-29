// application/usecases/aiPredictionUseCase.ts
import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { ModelService } from "../../domain/services/aiServices";

export class AIPredictionUseCase {
    constructor(
        private repository: CustomFieldRepository,
        private modelService: ModelService
    ) { }

    async predict(tenantId: string): Promise<any> {
        const fieldMapping = await this.repository.getPredictionMappings(tenantId);
        const rawData = await this.repository.getCustomerData(tenantId, fieldMapping);
        const payload = {
            field_mapping: fieldMapping.reduce((acc, cur) => {
                acc[cur.modelField] = cur.tenantField;
                return acc;
            }, {} as Record<string, string>),
            data: rawData
        };

        return this.modelService.predictChurn(payload);
    }
}
