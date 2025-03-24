import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { CustomFieldController } from "../controllers/customFieldController";

export const customFieldRoutes = Router();

customFieldRoutes.post("/", verifyToken, CustomFieldController.saveFields);
customFieldRoutes.get("/", verifyToken, CustomFieldController.getFields);