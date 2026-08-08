import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./products.routes.js";
import categoryRoutes from "./categories.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);

export default router;
