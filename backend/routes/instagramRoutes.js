// instagramRoutes.js
import express from "express";
import { instagramController } from "../controllers/instagramController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all Instagram routes
router.use(requireAuth);

/**
 * @route   GET /instagram/profile
 * @desc    Get Instagram business profile
 * @access  Private
 */
router.get("/profile", instagramController.getProfile);

/**
 * @route   GET /instagram/feed
 * @desc    Get Instagram media feed
 * @access  Private
 */
router.get("/feed", instagramController.getFeed);

/**
 * @route   GET /instagram/comments/:mediaId
 * @desc    Get comments for a media
 * @access  Private
 */
router.get("/comments/:mediaId", instagramController.getComments);

/**
 * @route   POST /instagram/comment/:commentId/reply
 * @desc    Reply to a comment
 * @access  Private
 */
router.post("/comment/:commentId/reply", instagramController.replyToComment);

export default router;
