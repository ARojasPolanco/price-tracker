import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./products.routes.js";
import categoryRoutes from "./categories.routes.js";
import creditAccountRoutes from "./creditAccounts.routes.js";
import saleRoutes from "./sales.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/credit-accounts", creditAccountRoutes);
router.use("/sales", saleRoutes);

export default router;
