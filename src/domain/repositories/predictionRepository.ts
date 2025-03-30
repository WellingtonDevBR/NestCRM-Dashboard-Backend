import { Prediction } from "../types/prediction"

export interface PredictionRepository {
    savePrediction(subdomain: string, prediction: Prediction): Promise<void>;
    getPredictions(subdomain: string): Promise<Prediction[]>;
}
