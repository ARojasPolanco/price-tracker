import { Router } from "express";
import * as controller from "../controllers/creditAccountController.js";
import { validate } from "../middlewares/validate.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { createCreditAccountSchema } from "../validations/creditAccountValidation.js";

const router = Router();

router.get("/", protect, requireRole("administrador"), controller.list);
router.get("/:id", protect, requireRole("administrador"), controller.getCreditAccountById);
router.post("/", protect, requireRole("administrador"), validate(createCreditAccountSchema), controller.create);

export default router;
