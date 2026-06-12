import express from "express";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";

export function authenticate(req,res,next) {
    try {
        let token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
        if(!token) {
            throw new AppError("Not authenticated", 401);
        }
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // { userId, role }
        next();
    }
    catch(err) {
        next(err);
    }
    
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
}