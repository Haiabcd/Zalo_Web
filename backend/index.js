import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./src/configs/db.js";
import cookieParser from "cookie-parser";
import cors from "./src/middlewares/cors.middleware.js";
import authRoutes from "./src/routes/auth.route.js";
import friendRoutes from "./src/routes/friend.route.js";
import MessageRoutes from "./src/routes/message.route.js";
import consumeUserUpdates from "./src/jobs/userUpdateConsumer.js";
import initializeSocket from "./src/utils/socket.js";

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

const PORT = process.env.PORT || 5001;
// consumeUserUpdates();

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
