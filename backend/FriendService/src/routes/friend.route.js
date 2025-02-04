const express = require("express");
const router = express.Router();
const FriendController = require("../controllers/friend.controller");

// Middleware xác thực (cần login trước)
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/request", authMiddleware, FriendController.sendRequest);
router.post("/accept", authMiddleware, FriendController.acceptRequest);
router.delete("/remove", authMiddleware, FriendController.removeFriend);
router.get("/list", authMiddleware, FriendController.getFriends);

module.exports = router;
