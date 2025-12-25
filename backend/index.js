import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  INSTAGRAM_REDIRECT_URI,
  PORT,
  FRONTEND_URL
} = process.env;

const app = express();

const whitelist = [FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in the whitelist or if it's a tool like Postman (!origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());



/**
 * STEP 1: Redirect user to Instagram Login
 */
app.get("/auth/instagram", (req, res) => {
  const authUrl =
    "https://www.instagram.com/oauth/authorize" +
    "?client_id=" + INSTAGRAM_APP_ID +
    "&redirect_uri=" + encodeURIComponent(INSTAGRAM_REDIRECT_URI) +
    "&scope=" +
    [
      "instagram_business_basic",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
    ].join(",") +
    "&response_type=code";

  res.redirect(authUrl);
});

/**
 * STEP 2: Instagram redirects back with ?code=
 */
let USER_ACCESS_TOKEN = null;

app.get("/auth/instagram/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const {
      access_token,
      user_id,
    } = tokenResponse.data;

    console.log("Instagram Access Token:", access_token);
    console.log("Instagram User ID:", user_id);

    // TEMP store (replace with DB/session later)
    global.IG_ACCESS_TOKEN = access_token;
    global.IG_USER_ID = user_id;

    res.redirect(FRONTEND_URL);

  } catch (error) {
    console.error(
      "Token exchange failed:",
      error.response?.data || error.message
    );
    res.status(500).send("Token exchange failed");
  }
});


app.get("/instagram/media/:mediaId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/v24.0/${req.params.mediaId}`,
      {
        params: {
          fields: "id,owner,caption",
          access_token: global.IG_ACCESS_TOKEN,
        },
      }
    );
    res.json(response.data);
  } catch (e) {
    res.json(e.response?.data);
  }
});


app.get("/instagram/profile", async (req, res) => {
  if (!global.IG_ACCESS_TOKEN || !global.IG_USER_ID) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const response = await axios.get(
      `https://graph.instagram.com/v24.0/me`,
      {
        params: {
          fields: "id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count",
          access_token: global.IG_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Profile fetch failed:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});


app.get("/instagram/feed", async (req, res) => {
  if (!global.IG_ACCESS_TOKEN) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const response = await axios.get(
      "https://graph.instagram.com/me/media",
      {
        params: {
          fields:
            "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
          access_token: global.IG_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Feed fetch failed:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

app.get("/instagram/comments/:mediaId", async (req, res) => {
  const { mediaId } = req.params;

  if (!global.IG_ACCESS_TOKEN) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const response = await axios.get(
      `https://graph.instagram.com/v24.0/${mediaId}/comments`,
      {
        params: {
          fields: "id,text,username,timestamp",
          access_token: global.IG_ACCESS_TOKEN,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Fetch comments failed:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/instagram/comment/:commentId/reply", async (req, res) => {
  const { commentId } = req.params;
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://graph.instagram.com/v24.0/${commentId}/replies`,
      null,
      {
        params: {
          message,
          access_token: global.IG_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});


/**
 * Root test
 */
app.get("/", (req, res) => {
  res.send("Secure Backend running 🔐");
});

https
  .createServer(
    {
      key: fs.readFileSync("../certs/localhost-key.pem"),
      cert: fs.readFileSync("../certs/localhost.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`HTTPS Backend running at ${process.env.PORT}`);
  });
