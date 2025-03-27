import { Router } from "express";
import { CustomFieldController } from "../controllers/customFieldController";
import { PredictionFieldMappingController } from "../controllers/predictionFieldMappingController";

export const customFieldRoutes = Router();

customFieldRoutes.post("/custom-fields", CustomFieldController.saveFields);
customFieldRoutes.get("/custom-fields", CustomFieldController.getFields);

// AI model mapping
customFieldRoutes.post("/prediction-mapping", PredictionFieldMappingController.saveMappings);
customFieldRoutes.get("/prediction-mapping", PredictionFieldMappingController.getMappings);
