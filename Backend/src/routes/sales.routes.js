import { Router } from "express";
import * as controller from "../controllers/saleController.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { createSaleSchema } from "../validations/saleValidation.js";

const router = Router();

router.get("/", protect, controller.list);
router.get("/:id", protect, controller.getSaleById);
router.post("/", protect, validate(createSaleSchema), controller.create);

export default router;
