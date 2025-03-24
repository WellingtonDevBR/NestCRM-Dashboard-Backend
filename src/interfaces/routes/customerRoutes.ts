import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { CustomerController } from "../controllers/customerController";

export const customerRoutes = Router();

customerRoutes.post("/", verifyToken, CustomerController.saveCustomer);
customerRoutes.get("/", verifyToken, CustomerController.getCustomers);