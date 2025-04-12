import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./src/configs/db.js";
import cookieParser from "cookie-parser";
import cors from "./src/middlewares/cors.middleware.js";
import authRoutes from "./src/routes/auth.route.js";
import friendRoutes from './src/routes/friend.route.js';
import MessageRoutes from "./src/routes/message.route.js";
import consumeUserUpdates from "./src/jobs/userUpdateConsumer.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Lưu trữ socketId của các thiết bị theo userId và deviceType
export const userSockets = new Map(); // Map: { userId: { web: socketId, app: socketId } }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const deviceType = socket.handshake.query.deviceType;

  if (userId && deviceType) {
    // Lưu socketId theo userId và deviceType
    if (!userSockets.has(userId)) {
      userSockets.set(userId, { web: null, app: null });
    }
    const userSocket = userSockets.get(userId);
    if (deviceType === "web") {
      userSocket.web = socket.id;
    } else if (deviceType === "app") {
      userSocket.app = socket.id;
    }
    console.log(
      `User ${userId} connected as ${deviceType} with socket ${socket.id}`
    );
  }

  socket.on("sendMessage", (message) => {
    io.emit("newMessage", message); // Phát sự kiện gửi tin nhắn
  });

  socket.on("disconnect", () => {
    if (userId && deviceType) {
      const userSocket = userSockets.get(userId);
      if (userSocket) {
        if (deviceType === "web" && userSocket.web === socket.id) {
          userSocket.web = null;
        } else if (deviceType === "app" && userSocket.app === socket.id) {
          userSocket.app = null;
        }
        // Xóa userId khỏi Map nếu không còn thiết bị nào kết nối
        if (!userSocket.web && !userSocket.app) {
          userSockets.delete(userId);
        }
      }
      console.log(`User ${userId} disconnected as ${deviceType}`);
    }
  });
});

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
consumeUserUpdates(); 

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

export {io}
