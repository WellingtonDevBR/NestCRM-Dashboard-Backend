import { Router } from "express";
import { AIController } from "../controllers/aiController";

export const aiRoutes = Router();

aiRoutes.post("/predict", AIController.predictChurn);
aiRoutes.get("/predict", AIController.getPredictions);
aiRoutes.get("/churn", AIController.getChurnRateByPeriod);