import { Request, Response } from "express";
import { DynamoCustomFieldRepository } from "../../infrastructure/repositories/dynamoCustomFieldRepository";
import { CustomFieldUseCase } from "../../application/usecases/customFieldUseCase";

const repository = new DynamoCustomFieldRepository();
const useCase = new CustomFieldUseCase(repository);

export class CustomFieldController {
    static async saveFields(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        const fields = req.body.fields;
        const category = req.body.category;

        if (!tenantId || !Array.isArray(fields) || !category) {
            return res.status(400).json({ error: "Missing tenant, category or invalid fields array" });
        }

        await useCase.saveFields(tenantId, fields, category);
        res.status(200).json({ message: "Fields saved successfully" });
    }

    static async getFields(req: Request, res: Response): Promise<any> {
        const tenantId = req.tenant?.Subdomain;
        const category = req.query.category as string;

        if (!tenantId || !category) {
            return res.status(400).json({ error: "Missing tenant or category" });
        }

        const fields = await useCase.getFields(tenantId, category as any);
        res.status(200).json(fields);
    }

}