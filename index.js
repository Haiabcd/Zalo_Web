import express from "express";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./src/configs/db.js";
import cookieParser from "cookie-parser";
import cors from "./src/middlewares/cors.middleware.js";
import authRoutes from "./src/routes/auth.route.js";
import friendRoutes from "./src/routes/friend.route.js";
import MessageRoutes from "./src/routes/message.route.js";
import conversationRoutes from "./src/routes/conversation.route.js";
import userRoutes from "./src/routes/user.route.js";

import { initializeSocket } from "./src/utils/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Khởi tạo socket
initializeSocket(server);

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
