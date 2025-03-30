import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PredictionRepository } from "../../domain/repositories/predictionRepository";
import { ModelService } from "../../domain/services/aiServices";

export class AIPredictionUseCase {
    constructor(
        private fieldRepo: CustomFieldRepository,
        private predictionRepo: PredictionRepository,
        private modelService: ModelService
    ) { }

    async predict(tenantId: string): Promise<any> {
        console.log(`🔍 [AIPredict] Starting prediction for tenant: ${tenantId}`);

        const mappings = await this.fieldRepo.getPredictionFieldMappings(tenantId);
        if (!mappings || mappings.length === 0) throw new Error("❌ No field mapping found");

        const rawData = await this.fieldRepo.getCustomerData(tenantId, mappings);
        if (!rawData || rawData.length === 0) throw new Error("❌ No data found to predict");

        const fullBatch: any[] = [];
        const lightBatch: any[] = [];
        const customerMap = new Map<string, any>(); // track originals

        for (const entry of rawData) {
            const encoded = normalizeCustomer(entry, mappings);
            customerMap.set(encoded.CustomerID, entry);

            if (hasAllFields(encoded, FULL_FEATURES)) {
                fullBatch.push(encoded);
            } else if (hasAllFields(encoded, LIGHT_FEATURES)) {
                lightBatch.push(trimToLightModel(encoded));
            }
        }

        const results: any[] = [];

        if (fullBatch.length > 0) {
            console.log(`🚀 Sending ${fullBatch.length} to FULL model`);
            const predictions = await this.modelService.predictChurn({ data: fullBatch });
            await this.predictionRepo.savePrediction(tenantId, predictions);
            results.push(...predictions);
        }

        if (lightBatch.length > 0) {
            console.log(`🚀 Sending ${lightBatch.length} to LIGHT model`);
            const predictions = await this.modelService.predictChurn({ data: lightBatch });
            await this.predictionRepo.savePrediction(tenantId, predictions);
            results.push(...predictions);
        }

        return results;
    }
}

// === Constants ===
const FULL_FEATURES = [
    "Age", "Gender", "Dependents", "Partner", "Tenure",
    "Usage_Frequency", "Total_Spend", "Support_Calls", "Payment_Delay",
    "Subscription_Type", "Contract_Length", "Days_Since_Last_Interaction"
];

const LIGHT_FEATURES = [
    "Age", "Gender", "Partner", "Tenure",
    "Usage_Frequency", "Days_Since_Last_Interaction"
];

// === Helpers ===

function encodeCategoricals(record: Record<string, any>) {
    const genderMap: any = { Male: 0, Female: 1 };
    const partnerMap: any = { Married: 0, Single: 1, Divorced: 2, Unknown: 3 };
    const subscriptionMap: any = { Basic: 0, Standard: 1, Premium: 2 };
    const contractMap: any = { Monthly: 0, Annual: 1, Quarterly: 2 };

    record.Gender = genderMap[record.Gender] ?? 0;
    record.Partner = partnerMap[record.Partner] ?? partnerMap.Unknown;
    record.Subscription_Type = subscriptionMap[record.Subscription_Type] ?? subscriptionMap.Basic;
    record.Contract_Length = contractMap[record.Contract_Length] ?? contractMap.Monthly;

    return record;
}

function normalizeCustomer(entry: any, mappings: any[]) {
    const flat: Record<string, any> = {};
    Object.entries(entry.customFields || {}).forEach(([k, v]) => flat[k] = v);
    Object.entries(entry.associations || {}).forEach(([k, v]) => flat[k] = v);

    const normalized: Record<string, any> = {};
    for (const { modelField, tenantField } of mappings) {
        normalized[modelField] = flat[tenantField];
    }

    normalized.Total_Spend ??= 0;
    normalized.Support_Calls ??= 0;
    normalized.CustomerID = entry.associations?.id ?? entry.id;

    return encodeCategoricals(normalized);
}

function trimToLightModel(record: Record<string, any>) {
    const trimmed = LIGHT_FEATURES.reduce((acc, key) => {
        acc[key] = record[key];
        return acc;
    }, {} as Record<string, any>);
    trimmed.CustomerID = record.CustomerID;
    return trimmed;
}

function hasAllFields(record: Record<string, any>, fields: string[]) {
    return fields.every(field => record[field] !== undefined);
}
