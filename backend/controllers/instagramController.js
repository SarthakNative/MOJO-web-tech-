// instagramController.js
import axios from "axios";
import { COOKIE_NAMES } from "./authController.js";

const GRAPH_BASE = "https://graph.facebook.com/v19.0";

export const instagramController = {
  getProfile: async (req, res) => {
    const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
    const igId = req.cookies[COOKIE_NAMES.IG_BUSINESS_ID];

    if (!token || !igId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const r = await axios.get(`${GRAPH_BASE}/${igId}`, {
        params: {
          fields:
            "id,username,profile_picture_url,followers_count,media_count,follows_count",
          access_token: token,
        },
      });
      res.json(r.data);
    } catch (e) {
      res.status(500).json(e.response?.data || { error: "Profile fetch failed" });
    }
  },

  getFeed: async (req, res) => {
    const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
    const igId = req.cookies[COOKIE_NAMES.IG_BUSINESS_ID];

    try {
      const r = await axios.get(`${GRAPH_BASE}/${igId}/media`, {
        params: {
          fields:
            "id,caption,media_type,media_url,permalink,timestamp",
          access_token: token,
        },
      });
      res.json(r.data);
    } catch (e) {
      res.status(500).json(e.response?.data || { error: "Feed fetch failed" });
    }
  },

 // Backend Controller
getComments: async (req, res) => {
  const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
  const { mediaId } = req.params;

  try {
    const r = await axios.get(`${GRAPH_BASE}/${mediaId}/comments`, {
      params: {
        fields: "id,text,username,timestamp,replies{id,text,username,timestamp}",
        access_token: token,
      },
    });
    res.json(r.data);
  } catch (e) {
    res.status(500).json(e.response?.data || { error: "Comments fetch failed" });
  }
},

replyToComment: async (req, res) => {
  const token = req.cookies[COOKIE_NAMES.SYSTEM_TOKEN];
  const { commentId } = req.params;
  const { message } = req.body;

  try {
    const r = await axios.post(
      `${GRAPH_BASE}/${commentId}/replies`,
      null,
      {
        params: {
          message,
          access_token: token,
        },
      }
    );
    
    // Fetch updated comment with replies
    const updatedComment = await axios.get(`${GRAPH_BASE}/${commentId}`, {
      params: {
        fields: "id,text,username,timestamp,replies{id,text,username,timestamp}",
        access_token: token,
      },
    });
    
    res.json(updatedComment.data);
  } catch (e) {
    res.status(500).json(e.response?.data || { error: "Reply failed" });
  }
},
};
