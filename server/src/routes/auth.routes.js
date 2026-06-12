import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { loginValidator, changePasswordValidator } from "../validators/auth.validators.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post('/login', loginValidator, validate, authController.login);
router.post('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
export default router;
