import { Request, Response } from "express";
import { DynamoPredictionFieldMappingRepository } from "../../infrastructure/repositories/dynamoPredictionFieldMappingRepository";
import { PredictionFieldMappingUseCase } from "../../application/usecases/predictionFieldMappingUseCase";

const repo = new DynamoPredictionFieldMappingRepository();
const useCase = new PredictionFieldMappingUseCase(repo);

export class PredictionFieldMappingController {
    static async saveMappings(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        const mappings = req.body.mappings;

        if (!tenantId || !Array.isArray(mappings)) {
            return res.status(400).json({ error: "Missing tenant or invalid mappings format" });
        }

        await useCase.saveMappings(tenantId, mappings);
        res.status(200).json({ message: "Prediction field mappings saved successfully" });
    }

    static async getMappings(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;

        if (!tenantId) {
            return res.status(400).json({ error: "Missing tenant" });
        }

        const mappings = await useCase.getMappings(tenantId);
        res.status(200).json(mappings);
    }
}
