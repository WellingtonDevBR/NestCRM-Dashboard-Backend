import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PredictionRepository } from "../../domain/repositories/predictionRepository";
import { RiskAlertRepository } from "../../domain/repositories/riskAlertRepository";
import { ModelService } from "../../domain/services/aiServices";
import { ChurnRate } from "../../domain/types/churnRate";
import { Prediction } from "../../domain/types/prediction";
import crypto from "crypto";
import { RiskCategory, RiskSeverity } from "../../domain/types/riskAlert";

export class AIPredictionUseCase {
    constructor(
        private fieldRepo: CustomFieldRepository,
        private predictionRepo: PredictionRepository,
        private modelService: ModelService,
        private riskAlertRepo: RiskAlertRepository
    ) { }

    async predict(tenantId: string): Promise<any> {
        console.log(`🔍 [AIPredict] Starting prediction for tenant: ${tenantId}`);

        const mappings = await this.fieldRepo.getPredictionFieldMappings(tenantId);
        if (!mappings || mappings.length === 0) throw new Error("❌ No field mapping found");

        const rawData = await this.fieldRepo.getCustomerData(tenantId, mappings);
        if (!rawData || rawData.length === 0) throw new Error("❌ No data found to predict");

        const fullBatch: any[] = [];
        const lightBatch: any[] = [];

        for (const entry of rawData) {
            const encoded = normalizeCustomer(entry, mappings);
            if (hasAllFields(encoded, FULL_FEATURES)) {
                fullBatch.push(encoded);
            } else if (hasAllFields(encoded, LIGHT_FEATURES)) {
                lightBatch.push(trimToLightModel(encoded));
            }
        }

        const results: any[] = [];

        if (fullBatch.length > 0) {
            const predictions = await this.modelService.predictChurn({ data: fullBatch });
            const saved = await this.saveOnlyIfChanged(tenantId, predictions);
            results.push(...saved);
        }

        if (lightBatch.length > 0) {
            const predictions = await this.modelService.predictChurn({ data: lightBatch });
            const saved = await this.saveOnlyIfChanged(tenantId, predictions);
            results.push(...saved);
        }

        return results;
    }

    async getLatestPredictions(tenantId: string): Promise<Prediction[]> {
        return this.predictionRepo.getPredictions(tenantId);
    }

    async getChurnRateByPeriod(subdomain: string, period: "daily" | "monthly" | "yearly" | "quarterly" = "monthly"): Promise<ChurnRate[]> {
        const predictions = await this.predictionRepo.getPredictions(subdomain);

        const grouped = new Map<string, { churned: number; total: number }>();

        for (const pred of predictions) {
            const date = new Date(pred.latest_prediction_at);
            let key: string;

            switch (period) {
                case "daily":
                    key = date.toISOString().split("T")[0];
                    break;
                case "yearly":
                    key = `${date.getUTCFullYear()}`;
                    break;
                case "quarterly": {
                    const q = Math.floor(date.getUTCMonth() / 3) + 1;
                    key = `${date.getUTCFullYear()}-Q${q}`;
                    break;
                }
                case "monthly":
                default:
                    key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
            }

            if (!grouped.has(key)) grouped.set(key, { churned: 0, total: 0 });

            const entry = grouped.get(key)!;
            entry.total++;
            if (pred.churn_prediction === "Yes") entry.churned++;
        }

        return Array.from(grouped.entries()).map(([period, { churned, total }]) => ({
            period,
            churn_rate: parseFloat(((churned / total) * 100).toFixed(2))
        })).sort((a, b) => a.period.localeCompare(b.period));
    }

    private async saveOnlyIfChanged(tenantId: string, predictions: Prediction[]) {

        const savedPredictions: Prediction[] = [];

        for (const prediction of predictions) {
            console.log(`[🔎] Checking prediction for ${prediction.customer_id}`);
            const latest = await this.predictionRepo.getLatestPrediction(tenantId, prediction.customer_id);

            const isSame = latest &&
                latest.churn_prediction === prediction.churn_prediction &&
                Math.abs(latest.churn_probability - prediction.churn_probability) < 0.01;

            if (!isSame) {
                const now = new Date().toISOString();

                if (latest) {
                    await this.predictionRepo.updateIsLatestFlag(
                        tenantId, latest.customer_id, latest.latest_prediction_at, false
                    );
                }

                const predictionToSave: Prediction = {
                    ...prediction,
                    latest_prediction_at: now,
                    is_latest: true,
                };

                await this.predictionRepo.savePrediction(tenantId, predictionToSave);
                savedPredictions.push(predictionToSave);
                console.log(`[✅] Saved prediction for ${prediction.customer_id} at ${now}`);

                if (prediction.risk_level === "High Risk") {
                    await this.riskAlertRepo.saveAlert(tenantId, {
                        id: prediction.customer_id,
                        category: "Churn Risk",
                        severity: "Critical",
                        message: "This customer is at high risk of churn.",
                        status: "New",
                        assigned_to: null,
                        created_at: now,
                    });
                }
                console.log(`[⚠️] High Risk detected for ${prediction.customer_id}`);

                const riskyFactors = prediction.key_factors.filter(f => {
                    return (
                        (f.feature === "Usage_Frequency" && f.contribution < -0.3) ||
                        (f.feature === "Payment_Delay" && f.contribution > 0.3) ||
                        (f.feature === "Support_Calls" && f.contribution > 0.3) ||
                        (f.feature === "Days_Since_Last_Interaction" && f.contribution > 0.3)
                    );
                });

                for (const factor of riskyFactors) {
                    const now = new Date().toISOString();
                    console.log(`[🚨] Saving alert for ${factor.feature} with score ${factor.contribution}`);

                    const categoryMap: Record<string, RiskCategory> = {
                        "Usage_Frequency": "Activity Drop",
                        "Payment_Delay": "Payment Issue",
                        "Support_Calls": "Support Escalation",
                        "Days_Since_Last_Interaction": "Activity Drop", // ou "Inactivity Alert" se for outro enum
                    };

                    const category: RiskCategory = categoryMap[factor.feature] || "Churn Risk";

                    const severity: RiskSeverity =
                        factor.contribution >= 0.7 ? "Critical" :
                            factor.contribution >= 0.4 ? "High" :
                                factor.contribution >= 0.2 ? "Medium" :
                                    "Low";
                    console.log(`[🔬] Risky factors for ${prediction.customer_id}:`, riskyFactors);

                    await this.riskAlertRepo.saveAlert(tenantId, {
                        id: prediction.customer_id,
                        category,
                        severity,
                        message: `Risk detected from ${factor.feature} (impact score: ${factor.contribution.toFixed(2)})`,
                        status: "New",
                        assigned_to: null,
                        created_at: now,
                    });
                }

            }
        }

        return savedPredictions;
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
