import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./products.routes.js";
import categoryRoutes from "./categories.routes.js";
import creditAccountRoutes from "./creditAccounts.routes.js";
import saleRoutes from "./sales.routes.js";
import expenseRoutes from "./expenses.routes.js";
import invoiceRoutes from "./invoices.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/credit-accounts", creditAccountRoutes);
router.use("/sales", saleRoutes);
router.use("/expenses", expenseRoutes);
router.use("/invoices", invoiceRoutes);

export default router;
