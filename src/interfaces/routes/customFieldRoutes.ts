import { Router } from "express";
import { CustomFieldController } from "../controllers/customFieldController";

export const customFieldRoutes = Router();

customFieldRoutes.post("/", CustomFieldController.saveFields);
customFieldRoutes.get("/", CustomFieldController.getFields);