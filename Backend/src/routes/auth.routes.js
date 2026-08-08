import { Router } from "express";
import * as controller from "../controllers/auth/authController.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validations/auth/authValidation.js";

const router = Router();

router.post("/login", validate(loginSchema), controller.login);

export default router;
