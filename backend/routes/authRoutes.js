// authRoutes.js
import express from "express";
import { authController } from "../controllers/authController.js";

const router = express.Router();

/**
 * @route   POST /auth/init
 * @desc    Initialize auth using System User Token (one-time / admin)
 * @access  Public (protect later if needed)
 */
router.post("/init", authController.initAuth);

/**
 * @route   GET /auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get("/status", authController.checkAuthStatus);

/**
 * @route   POST /auth/logout
 * @desc    Clear auth cookies
 * @access  Public
 */
router.post("/logout", authController.logout);

export default router;
