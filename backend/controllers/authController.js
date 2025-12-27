// authController.js
import axios from "axios";

export const COOKIE_NAMES = {
  SYSTEM_TOKEN: "system_user_token",
  IG_BUSINESS_ID: "ig_business_id",
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const authController = {
  /**
   * INIT AUTH (one-time setup)
   * Call this ONCE after deploy or from an admin route
   */
  initAuth: async (req, res) => {
    try {
      const SYSTEM_USER_TOKEN = process.env.SYSTEM_USER_TOKEN;
      const PAGE_ID = process.env.PAGE_ID;

      // Step 1: Get IG business account from Page
      const igRes = await axios.get(
        `https://graph.facebook.com/v19.0/${PAGE_ID}`,
        {
          params: {
            fields: "instagram_business_account",
            access_token: SYSTEM_USER_TOKEN,
          },
        }
      );

      const igBusinessId = igRes.data.instagram_business_account?.id;

      if (!igBusinessId) {
        return res.status(400).json({
          error: "No Instagram Business Account linked to this Page",
        });
      }

      // Store in cookies (or DB in real apps)
      res.cookie(COOKIE_NAMES.SYSTEM_TOKEN, SYSTEM_USER_TOKEN, COOKIE_OPTIONS);
      res.cookie(COOKIE_NAMES.IG_BUSINESS_ID, igBusinessId, COOKIE_OPTIONS);

      res.json({
        success: true,
        ig_business_id: igBusinessId,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: "Auth initialization failed" });
    }
  },

  checkAuthStatus: (req, res) => {
    const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
    const igId = req.cookies[COOKIE_NAMES.IG_BUSINESS_ID];

    res.json({
      authenticated: !!(token && igId),
      ig_business_id: igId || null,
    });
  },

  logout: (req, res) => {
    Object.values(COOKIE_NAMES).forEach((c) => res.clearCookie(c));
    res.json({ success: true });
  },
};
