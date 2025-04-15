import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sendMessage", protectRoute, sendMessage);
router.get("/getMessages/:conversationId", protectRoute, getMessages);

export default router;
