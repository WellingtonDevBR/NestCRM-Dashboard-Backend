import { Router } from "express";
import { CustomerController } from "../controllers/customerController";
import { verifyToken } from "../middleware/verifyToken";

export const customerRoutes = Router();

customerRoutes.post("/", verifyToken, CustomerController.saveCustomer);
customerRoutes.get("/", verifyToken, CustomerController.getCustomers);