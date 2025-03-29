import { Request, Response } from "express";
import { DynamoCustomFieldRepository } from "../../infrastructure/repositories/dynamoCustomFieldRepository";
import { CustomFieldUseCase } from "../../application/usecases/customFieldUseCase";
import { FieldCategory } from "../../domain/types/customFields";

const repository = new DynamoCustomFieldRepository();
const useCase = new CustomFieldUseCase(repository);

export class CustomFieldController {
    static async saveFields(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) return res.status(400).json({ error: "Missing subdomain" });

        try {
            await useCase.saveFields(subdomain, req.body);
            res.status(200).json({ message: "Fields saved successfully" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getFields(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) return res.status(400).json({ error: "Missing subdomain" });

        try {
            const category = req.query.category as FieldCategory | undefined;
            if (!category) {
                const grouped = await useCase.getAllFieldsGroupedByCategory(subdomain);
                return res.status(200).json(grouped);
            }

            const fields = await useCase.getFields(subdomain, category);
            res.status(200).json(fields);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async savePredictionPayload(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        if (!tenantId) {
            return res.status(400).json({ error: "Missing tenant" });
        }

        const { field_mapping } = req.body;
        if (!field_mapping || typeof field_mapping !== "object") {
            return res.status(400).json({ error: "Invalid field_mapping format" });
        }

        try {
            await useCase.savePredictionMapping(tenantId, field_mapping);
            res.status(200).json({ message: "Prediction mapping saved successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }



    static async getPredictionPayload(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) return res.status(400).json({ error: "Missing subdomain" });

        try {
            const payload = await useCase.generatePayload(subdomain);
            res.status(200).json(payload);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
