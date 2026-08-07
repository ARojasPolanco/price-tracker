import { Router } from "express";
import * as controller from "../controllers/productController.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema } from "../validations/productValidation.js";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getProductById);
router.post("/", validate(createProductSchema), controller.create);
router.put("/:id", validate(updateProductSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;
