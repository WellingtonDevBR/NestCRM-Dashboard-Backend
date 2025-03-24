import { Router } from "express";
import { CustomFieldController } from "../controllers/CustomFieldController";
import { verifyToken } from "../middleware/verifyToken";

const customFieldRoutes = Router();

customFieldRoutes.post("/", verifyToken, CustomFieldController.saveFields);
customFieldRoutes.get("/", verifyToken, CustomFieldController.getFields);

export default customFieldRoutes;
