import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js";
import dotenv from "dotenv";
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

dotenv.config();

app.use(express.json());

const hostname = "localhost";
const PORT = process.env.PORT;

app.use("/api/messages", messageRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, hostname, () => {
  // eslint-disable-next-line no-console
  console.log("Server is running on port " + PORT);
  connectDB();
});
