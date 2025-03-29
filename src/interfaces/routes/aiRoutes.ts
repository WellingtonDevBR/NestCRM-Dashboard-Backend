import { Router } from "express";
import { AIController } from "../controllers/aiController";

export const aiRoutes = Router();

aiRoutes.post("/predict", AIController.predictChurn);
