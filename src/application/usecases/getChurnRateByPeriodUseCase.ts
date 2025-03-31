import { PredictionRepository } from "../../domain/repositories/predictionRepository";
import { ChurnRate } from "../../domain/types/churnRate";

export class GetChurnRateByPeriodUseCase {
    constructor(private predictionRepo: PredictionRepository) { }

    async execute(subdomain: string, period: "daily" | "monthly" | "yearly" | "quarterly" = "monthly"): Promise<ChurnRate[]> {
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
}
