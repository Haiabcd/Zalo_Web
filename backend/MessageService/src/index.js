import express from "express";
import MessageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "./middleware/cors.middleware.js";
import initializeSocket from "./socket/socketHandler.js";
import http from "http";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors);

const hostname = "localhost";
const PORT = process.env.PORT || 5003;
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/messages", MessageRoutes);

const io = initializeSocket(server);

app.listen(PORT, hostname, () => {
  console.log(
    "MessageService is running on port http://localhost:5003/api/messages/"
  );
  connectDB();
});
