import { Request, Response } from "express";
import { CustomerUseCase } from "../../application/usecases/CustomerUseCase";
import { DynamoCustomerRepository } from "../../infrastructure/repositories/DynamoCustomerRepository";
import { v4 as uuidv4 } from "uuid";

const repository = new DynamoCustomerRepository();
const useCase = new CustomerUseCase(repository);

export class CustomerController {
    static async saveCustomer(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) return res.status(400).json({ error: "Missing subdomain" });

        const { name, email, phone, customFields } = req.body;

        if (!name) return res.status(400).json({ error: "Customer name is required" });

        const newCustomer = {
            CustomerID: uuidv4(),
            Name: name,
            Email: email,
            Phone: phone,
            CreatedAt: new Date().toISOString(),
            CustomFields: customFields || {},
        };

        await useCase.saveCustomer(subdomain, newCustomer);
        res.status(201).json({ message: "Customer created successfully" });
    }

    static async getCustomers(req: Request, res: Response): Promise<any> {
        const subdomain = req.tenant?.Subdomain;
        if (!subdomain) return res.status(400).json({ error: "Missing subdomain" });

        const customers = await useCase.getCustomers(subdomain);
        res.status(200).json(customers);
    }
}