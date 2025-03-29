import { Router } from "express";
import { CustomFieldController } from "../controllers/customFieldController";

export const customFieldRoutes = Router();

customFieldRoutes.post("/custom-fields", CustomFieldController.saveFields);
customFieldRoutes.get("/custom-fields", CustomFieldController.getFields);
customFieldRoutes.get("/prediction-payload", CustomFieldController.getPredictionPayload);
