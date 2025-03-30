import { Request, Response } from "express";
import { DynamoCustomFieldRepository } from "../../infrastructure/repositories/dynamoCustomFieldRepository";
import { PythonModelService } from "../../infrastructure/services/pythonModelService";
import { AIPredictionUseCase } from "../../application/usecases/aiUseCase";
import { DynamoPredictionRepository } from "../../infrastructure/repositories/DynamoPredictionRepository";

const repository = new DynamoCustomFieldRepository();
const modelService = new PythonModelService();
const predictionRepository = new DynamoPredictionRepository();
const useCase = new AIPredictionUseCase(repository, predictionRepository, modelService);

export class AIController {
    static async predictChurn(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) {
            return res.status(400).json({ error: "Missing subdomain" });
        }

        try {
            const result = await useCase.predict(subdomain);
            res.status(200).json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
}
