import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");
    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@"),
    ); // Hide credentials in logs

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });

    // Log more details about the error
    if (error.name === "MongoServerSelectionError") {
      console.error(
        "⚠️ Could not connect to MongoDB server. Check your network and MongoDB URI.",
      );
    } else if (error.name === "MongoParseError") {
      console.error(
        "⚠️ Invalid MongoDB URI format. Check your connection string.",
      );
    }

    // Don't exit process in production, but log the error
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

export default connectDB;
