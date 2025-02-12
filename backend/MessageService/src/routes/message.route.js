import express from "express";
import {
  send,
  getMessagesBetweenTwoUsers,
} from "../controllers/message.controller.js";

// Tạo router để xử lý các request tới /api/friend
const router = express.Router();

router.post("/send", send);
router.get("/getMessage", getMessagesBetweenTwoUsers);

export default router;
