import express from "express";
import {
  sendRequest,
  remove,
  getFriends,
  acceptRequest,
} from "../controllers/friend.controller.js";

// Middleware xác thực (cần login trước)
import { protectRoute } from "../middleware/auth.middleware.js";

// Tạo router để xử lý các request tới /api/friend
const router = express.Router();

router.post("/request", protectRoute, sendRequest);
router.post("/accept", protectRoute, acceptRequest);
router.get("/list", protectRoute, getFriends);

// router.delete("/remove", protectRoute, removeFriend);

export default router;
