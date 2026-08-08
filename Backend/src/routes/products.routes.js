import { Router } from "express";
import * as controller from "../controllers/productController.js";
import { validate } from "../middlewares/validate.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { createProductSchema, updateProductSchema } from "../validations/productValidation.js";

const router = Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, controller.getProductById);
router.post("/", protect, requireRole("administrador"), validate(createProductSchema), controller.create);
router.put("/:id", protect, requireRole("administrador"), validate(updateProductSchema), controller.update);
router.delete("/:id", protect, requireRole("administrador"), controller.remove);

export default router;
