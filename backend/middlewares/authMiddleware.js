// authMiddleware.js 
import { COOKIE_NAMES } from '../controllers/authController.js'; // Import the cookie names

/**
 * Helper function to get auth data from cookies
 */
const getAuthFromCookies = (req) => {
  const igAccessToken = req.cookies[COOKIE_NAMES.IG_ACCESS_TOKEN];
  const igUserId = req.cookies[COOKIE_NAMES.IG_USER_ID];
  
  return {
    igAccessToken,
    igUserId,
    isAuthenticated: !!(igAccessToken && igUserId)
  };
};

/**
 * Authentication middleware
 * Checks if user is authenticated with Instagram
 */
// authMiddleware.js

export const requireAuth = (req, res, next) => {
  const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
  const igId = req.cookies[COOKIE_NAMES.IG_BUSINESS_ID];

  if (!token || !igId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  next();
};

/**
 * Optional auth middleware
 * Continues even if not authenticated, but adds auth info to request
 */
export const optionalAuth = (req, res, next) => {
  const { isAuthenticated, igAccessToken, igUserId } = getAuthFromCookies(req);
  
  req.isAuthenticated = isAuthenticated;
  req.igUserId = igUserId;
  req.igAccessToken = igAccessToken;
  
  next();
};