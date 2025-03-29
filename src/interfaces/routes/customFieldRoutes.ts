import { Router } from "express";
import { CustomFieldController } from "../controllers/customFieldController";

export const customFieldRoutes = Router();

// Define the routes for custom fields
customFieldRoutes.post("/custom-fields", CustomFieldController.saveFields);
customFieldRoutes.get("/custom-fields", CustomFieldController.getFields);

// Add the following line to map the prediction payload route
customFieldRoutes.post("/prediction-mapping", CustomFieldController.savePredictionPayload);
customFieldRoutes.get("/prediction-mapping", CustomFieldController.getPredictionFieldMappings);
