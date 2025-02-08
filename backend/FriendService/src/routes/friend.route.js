import express from "express";
import {
  sendRequest,
  remove,
  getFriends,
  acceptRequest,
} from "../controllers/friend.controller.js";

// Middleware xác thực (cần login trước)
import authMiddleware from "../middleware/auth.middleware.js";

// Tạo router để xử lý các request tới /api/friend
const router = express.Router();

router.post("/request", sendRequest); //phải có authMiddleware
router.post("/accept", acceptRequest); //phải có authMiddleware
// router.delete("/remove", authMiddleware, FriendController.removeFriend);
// router.get("/list", authMiddleware, FriendController.getFriends);

export default router;
