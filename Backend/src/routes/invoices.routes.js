import { Router } from "express";
import * as controller from "../controllers/invoiceController.js";
import { validate } from "../middlewares/validate.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { createInvoiceSchema } from "../validations/invoiceValidation.js";

const router = Router();

router.get("/", protect, requireRole("administrador"), controller.list);
router.get("/:id", protect, requireRole("administrador"), controller.getInvoiceById);
router.post("/", protect, requireRole("administrador"), validate(createInvoiceSchema), controller.create);
router.patch("/:id/pay", protect, requireRole("administrador"), controller.markAsPaid);
router.delete("/:id", protect, requireRole("administrador"), controller.remove);

export default router;
