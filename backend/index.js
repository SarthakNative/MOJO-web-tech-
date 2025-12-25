import express from "express";
import cors from "cors";
import https from "https";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const {
  PORT,
  FRONTEND_URL,
  NODE_ENV = "development"
} = process.env;

const app = express();

// CORS configuration
const whitelist = [FRONTEND_URL];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin && NODE_ENV === "development") {
      return callback(null, true);
    }
    
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use("/", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: "CORS Error",
      message: "Request not allowed from this origin"
    });
  }
  
  res.status(500).json({
    error: "Internal Server Error",
    message: NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// Conditionally create server based on environment
let server;
const startServer = () => {
  if (NODE_ENV === "production") {
    // In production, let the platform (like AWS, Heroku, etc.) handle HTTPS
    // or use auto-generated certificates
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Production HTTP Backend running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🌐 Environment: ${NODE_ENV}`);
      console.log(`⚠️  Note: HTTPS should be terminated at load balancer/reverse proxy level`);
    });
  } else {
    // Local development - use custom certificates
    try {
      const certOptions = {
        key: fs.readFileSync("../certs/localhost-key.pem"),
        cert: fs.readFileSync("../certs/localhost.pem"),
      };
      
      server = https.createServer(certOptions, app);
      server.listen(PORT, () => {
        console.log(`🚀 HTTPS Backend running at https://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
        console.log(`🌐 Environment: ${NODE_ENV}`);
        console.log(`🔐 Using custom certificates from ../certs/`);
      });
    } catch (error) {
      console.error("❌ Failed to load SSL certificates for local development");
      console.error("Error details:", error.message);
      console.log("📁 Make sure certificates exist in ../certs/ directory");
      console.log("💡 You can generate them with:");
      console.log("   mkcert localhost");
      console.log("   or");
      console.log("   openssl req -x509 -newkey rsa:4096 -keyout ../certs/localhost-key.pem -out ../certs/localhost.pem -days 365 -nodes");
      
      // Fallback to HTTP for development if certificates aren't available
      console.log("🔄 Falling back to HTTP for development...");
      server = http.createServer(app);
      server.listen(PORT, () => {
        console.log(`🚀 HTTP Backend running at http://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
        console.log(`🌐 Environment: ${NODE_ENV}`);
      });
    }
  }
};

startServer();

// Optional: Export server for testing
export { app, server };