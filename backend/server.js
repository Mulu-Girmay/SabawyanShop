import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import connectDB from "./src/config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Middleware
    app.use(helmet());
    app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      }),
    );
    app.use(compression());
    app.use(morgan("dev"));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Health check
    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        mongodb:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      });
    });

    // Basic route
    app.get("/", (req, res) => {
      res.json({
        message: "CollabCart API is running",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          api: "/api/v1",
        },
      });
    });

    // API Routes (commented out until you create them)
    // import authRoutes from './src/routes/auth.routes.js';
    // import userRoutes from './src/routes/user.routes.js';
    // app.use('/api/v1/auth', authRoutes);
    // app.use('/api/v1/users', userRoutes);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: "Route not found",
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error("❌ Error:", err.message);
      res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error",
      });
    });

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("📡 Received shutdown signal...");
  httpServer.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed");
      console.log("🛑 Server closed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start the application
startServer();

export default app;
