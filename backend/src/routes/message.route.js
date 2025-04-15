import express from "express";
import { sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sendMessage", protectRoute, sendMessage);

export default router;
