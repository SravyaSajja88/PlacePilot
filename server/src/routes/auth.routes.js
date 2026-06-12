import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { loginValidator } from "../validators/auth.validators.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post('/login', loginValidator, validate, authController.login);
export default router;
