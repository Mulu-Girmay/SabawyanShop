import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticate } from "./middleware/auth.js";
import chatSocket from "./sockets/chat.socket.js";
import logger from "./utils/logger.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import socialRoutes from "./routes/social.routes.js";
import groupBuyRoutes from "./routes/groupbuy.routes.js";
import orderRoutes from "./routes/order.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
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
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/group-buy", groupBuyRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/chat", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Socket.io handlers
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.userId}`);

  // Join user's personal room
  socket.join(`user:${socket.userId}`);

  // Handle chat messages
  chatSocket(io, socket);

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`user:${data.receiverId}`).emit("typing", {
      senderId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(`user:${data.receiverId}`).emit("stop-typing", {
      senderId: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

export { app, httpServer, io };
