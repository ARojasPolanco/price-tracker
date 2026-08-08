import { Router } from "express";
import * as controller from "../controllers/categoryController.js";
import { validate } from "../middlewares/validate.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { createCategorySchema, updateCategorySchema } from "../validations/categoryValidation.js";

const router = Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, controller.getCategoryById);
router.post("/", protect, requireRole("administrador"), validate(createCategorySchema), controller.create);
router.put("/:id", protect, requireRole("administrador"), validate(updateCategorySchema), controller.update);
router.delete("/:id", protect, requireRole("administrador"), controller.remove);

export default router;
