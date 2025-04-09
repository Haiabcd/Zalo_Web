import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "./middleware/cors.middleware.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Khởi tạo WebSocket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Domain của FE
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

// Export io để sử dụng trong các controller
export { io };

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// Khởi động server sau khi kết nối database thành công
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB(); // Kết nối database trước khi khởi động server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
