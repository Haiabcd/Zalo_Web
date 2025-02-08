import express from "express";
import friendRoutes from "./routes/friend.route.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "./middleware/cors.middleware.js";

dotenv.config();
const app = express();
// Áp dụng CORS middleware
app.use(cors);

const hostname = "localhost";
const PORT = process.env.PORT || 5002;
app.use(express.json()); // Sử dụng middleware để đọc dữ liệu từ body của request
app.use(cookieParser()); // Sử dụng cookie parser để đọc cookie từ request

app.use("/api/friends", friendRoutes);

app.listen(PORT, hostname, () => {
  console.log(
    "FriendService is running on port http://localhost:5002/api/friends/"
  );
  connectDB();
});
