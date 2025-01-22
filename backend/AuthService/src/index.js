import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";


dotenv.config();

const app = express();

const hostname = "localhost";
const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);

app.listen(PORT, hostname, () => {
  // eslint-disable-next-line no-console
  console.log("Server is running on port " + PORT);
  connectDB();
});