import { Router } from "express";
import * as controller from "../controllers/expenseController.js";
import { validate } from "../middlewares/validate.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { createExpenseSchema } from "../validations/expenseValidation.js";

const router = Router();

router.get("/", protect, requireRole("administrador"), controller.list);
router.get("/:id", protect, requireRole("administrador"), controller.getExpenseById);
router.post("/", protect, requireRole("administrador"), validate(createExpenseSchema), controller.create);
router.delete("/:id", protect, requireRole("administrador"), controller.remove);

export default router;
