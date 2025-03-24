import { Router } from "express";
import { CustomFieldController } from "../controllers/CustomFieldController";
import { verifyToken } from "../middleware/verifyToken";

export const customFieldRoutes = Router();

customFieldRoutes.post("/", verifyToken, CustomFieldController.saveFields);
customFieldRoutes.get("/", verifyToken, CustomFieldController.getFields);