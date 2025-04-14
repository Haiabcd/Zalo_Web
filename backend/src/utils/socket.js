import { Server } from "socket.io";

// Lưu trữ socketId của các thiết bị theo userId và deviceType
export const userSockets = new Map();
export let io;
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { userId, deviceType } = socket.handshake.query;

    if (userId && deviceType) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, { web: null, app: null });
      }

      const userSocket = userSockets.get(userId);
      userSocket[deviceType] = socket.id;

      console.log(
        `🔌 User ${userId} connected via ${deviceType}: ${socket.id}`
      );
    }

    socket.on("sendMessage", (message) => {
      io.emit("newMessage", message); // Broadcast đến tất cả
    });

    socket.on("disconnect", () => {
      if (userId && deviceType) {
        const userSocket = userSockets.get(userId);
        if (userSocket?.[deviceType] === socket.id) {
          userSocket[deviceType] = null;
        }

        if (!userSocket?.web && !userSocket?.app) {
          userSockets.delete(userId);
        }

        console.log(`❌ User ${userId} disconnected from ${deviceType}`);
      }
    });
  });

  return io;
};

export default initializeSocket;
