import dotenv from "dotenv";
import { httpServer } from "./src/app.js";
import logger from "./src/utils/logger.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info("Received shutdown signal, closing server gracefully...");
  httpServer.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error(
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
  logger.error("Unhandled Rejection:", err);
});

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API URL: http://localhost:${PORT}/api/v1`);
});

export default httpServer;
