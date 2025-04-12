import { Server } from "socket.io";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", 
    },
  });

  io.on("connection", (socket) => {
    console.log("Người dùng đã kết nối:", socket.id);

    socket.on("sendMessage", (message) => {
      io.emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("Người dùng đã ngắt kết nối:", socket.id);
    });
  });

  return io;
};

export default initializeSocket;
