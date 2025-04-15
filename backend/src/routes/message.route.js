import express from "express";
import {
  sendMessage,
  getMessages,
  sendFile,
} from "../controllers/message.controller.js";
import upload, {
  checkFileSize,
} from "../middlewares/uploadFileChat.middleware.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sendMessage", protectRoute, sendMessage);
router.get("/getMessages/:conversationId", protectRoute, getMessages);
router.post("/send-file", upload, checkFileSize, protectRoute, sendFile);

export default router;
