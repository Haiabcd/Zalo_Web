import express from "express";
import {
  sendMessage,
  getMessages,
  sendFile,
  sendFolder,
  handleRecallMessage,
  deleteMessage,
  forwardMessage,
} from "../controllers/message.controller.js";

import {
  uploadSingle,
  uploadMultiple,
  checkFileSize,
} from "../middlewares/uploadFileChat.middleware.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/sendMessage", protectRoute, sendMessage);
router.get("/getMessages/:conversationId", protectRoute, getMessages);
router.post("/send-file", uploadSingle, checkFileSize, protectRoute, sendFile);
router.post(
  "/send-folder",
  protectRoute,
  uploadMultiple,
  checkFileSize,
  sendFolder
);
router.post("/recall-message", protectRoute, handleRecallMessage);
router.post("/delete-message", protectRoute, deleteMessage);
router.post("/forward", protectRoute, forwardMessage);

export default router;
