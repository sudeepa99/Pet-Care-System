console.log("🚀 ===== APPLICATION STARTING =====");
console.log("⭐ Process ID:", process.pid);
console.log("⭐ Node.js version:", process.version);
console.log("⭐ NODE_ENV:", process.env.NODE_ENV);
console.log("⭐ PORT:", process.env.PORT);
console.log("⭐ Current directory:", process.cwd());
console.log("⭐ File list:", require("fs").readdirSync("."));
console.log("🚀 ===== STARTING EXPRESS SERVER =====");

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Route imports
import authRoute from "./Routes/auth.js";
import petRoutes from "./Routes/pet.js";
import userRoutes from "./Routes/user.js";

// Middleware imports
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8000;

// Configure CORS
const corsOptions = {
  origin: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};

// Database connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    // Optional retry mechanism
    setTimeout(connectDB, 5000);
  }
};

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

//Health check endpoint (Critical for Azure)**
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/pets", petRoutes);
app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

// Start the server
// app.listen(port, async () => {
//   await connectDB();
//   console.log(`Server is running on port ${port}`);
// });

// Connect DB before starting server**
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
