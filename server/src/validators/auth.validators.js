import {body} from "express-validator";

export const loginValidator = [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().isLength({min: 8 }).withMessage("Password must be at least 8 characters long")
];