import dotenv from "dotenv";
import { httpServer } from "./src/app.js";
import connectDB from "./src/config/database.js";
import logger from "./src/utils/logger.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", "),
  );
  console.error("Please check your .env file");
  process.exit(1);
}

const PORT = process.env.PORT || 5001;

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Received shutdown signal, closing server gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Unhandled rejection handler
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Start server only after database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Then start the server
    httpServer.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` API URL: http://localhost:${PORT}/api/v1`);
      console.log(` Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default httpServer;
