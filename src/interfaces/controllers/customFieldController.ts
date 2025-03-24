import { Request, Response } from "express";
import { DynamoCustomFieldRepository } from "../../infrastructure/repositories/dynamoCustomFieldRepository";
import { CustomFieldUseCase } from "../../application/usecases/customFieldUseCase";

const repository = new DynamoCustomFieldRepository();
const useCase = new CustomFieldUseCase(repository);

export class CustomFieldController {
    static async saveFields(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        const fields = req.body.fields;

        if (!tenantId || !Array.isArray(fields)) {
            return res.status(400).json({ error: "Invalid payload" });
        }

        await useCase.saveFields(tenantId, fields);
        res.status(200).json({ message: "Fields saved successfully" });
    }

    static async getFields(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        if (!tenantId) {
            return res.status(400).json({ error: "Tenant not found" });
        }

        const fields = await useCase.getFields(tenantId);
        res.status(200).json(fields);
    }
}