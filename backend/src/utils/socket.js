import { Server } from "socket.io";

// Lưu trữ socketId của các thiết bị theo userId và deviceType
export const userSockets = new Map();

export let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { userId, deviceType } = socket.handshake.query;

    if (!userId || !deviceType) {
      socket.disconnect(true);
      return;
    }

    // Validate deviceType
    if (!["web", "app"].includes(deviceType)) {
      socket.disconnect(true);
      return;
    }
    // Initialize user socket map if not exists
    if (!userSockets.has(userId)) {
      userSockets.set(userId, { web: null, app: null });
    }

    // Update socket ID for the device type
    const userSocket = userSockets.get(userId);
    userSocket[deviceType] = socket.id;

    console.log(`🔌 User ${userId} connected via ${deviceType}: ${socket.id}`);

    // Handle disconnection
    socket.on("disconnect", () => {
      const userSocket = userSockets.get(userId);
      if (userSocket?.[deviceType] === socket.id) {
        userSocket[deviceType] = null;
      }

      // Clean up if no active connections
      if (userSocket && !userSocket.web && !userSocket.app) {
        userSockets.delete(userId);
      }

      console.log(`❌ User ${userId} disconnected from ${deviceType}`);
    });
  });

  return io;
};
export const emitFriendRequest = (receiverId, data) => {
  const userSocket = userSockets.get(receiverId.toString());
  if (userSocket) {
    if (userSocket.web) {
      io.to(userSocket.web).emit("friendRequest", data);
    }
    if (userSocket.app) {
      io.to(userSocket.app).emit("friendRequest", data);
    }
  }
};

export const emitFriendRequestAccepted = (senderId, data) => {
  const userSocket = userSockets.get(senderId.toString());
  if (userSocket) {
    if (userSocket.web) {
      io.to(userSocket.web).emit("friendRequestAccepted", data);
    }
    if (userSocket.app) {
      io.to(userSocket.app).emit("friendRequestAccepted", data);
    }
  }
};
