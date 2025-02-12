import { Server } from "socket.io";
import { sendMessage } from "../services/message.service.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on(
      "sendMessage",
      async ({ senderId, receiverId, messageType, content }) => {
        try {
          const newMessage = await sendMessage(
            senderId,
            receiverId,
            messageType,
            content
          );

          // Gửi tin nhắn đến người nhận
          io.emit(`receiveMessage:${receiverId}`, newMessage);
        } catch (error) {
          console.error("❌ Error sending message:", error.message);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
