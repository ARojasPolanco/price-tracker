import { Router } from "express";
import * as controller from "../controllers/reportController.js";
import { protect, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/sales", protect, requireRole("administrador"), controller.sales);
router.get("/income", protect, requireRole("administrador"), controller.income);
router.get("/expenses", protect, requireRole("administrador"), controller.expenses);
router.get("/invoices", protect, requireRole("administrador"), controller.invoices);
router.get("/credit-accounts-pending", protect, requireRole("administrador"), controller.pendingCreditAccounts);

export default router;
