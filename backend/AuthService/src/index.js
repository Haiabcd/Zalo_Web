import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "./middleware/cors.middleware.js";

dotenv.config();

const app = express();

// Áp dụng CORS middleware
app.use(cors);

const hostname = "localhost";
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, hostname, () => {
  console.log(
    "Server is running on port http://localhost:5001/api/auth/login "
  );
  connectDB();
});
