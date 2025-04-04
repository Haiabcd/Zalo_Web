import express from "express";
import {
  send,
  getMessagesBetweenTwoUsers,
  getLastMessage,
  getImage,
} from "../controllers/message.controller.js";

// Tạo router để xử lý các request tới /api/friend
const router = express.Router();

router.post("/send", send);
router.get("/getMessage", getMessagesBetweenTwoUsers);
router.get("/last-message", getLastMessage);
router.get("/image", getImage);

export default router;
