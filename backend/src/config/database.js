import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("📡 Connecting to MongoDB...");

    // Remove deprecated options - they are now default in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

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

    if (error.name === "MongoServerSelectionError") {
      console.error(
        "⚠️ Could not connect to MongoDB server. Check your network and MongoDB URI.",
      );
    } else if (error.name === "MongoParseError") {
      console.error(
        "⚠️ Invalid MongoDB URI format or options. Check your connection string.",
      );
    }

    throw error;
  }
};

export default connectDB;
