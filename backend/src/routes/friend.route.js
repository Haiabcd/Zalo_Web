import express from "express";
import {
  sendRequest,
  remove,
  getFriends,
  acceptRequest,
  getFriendRequests,
  checkFriendshipStatus,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/request", protectRoute, sendRequest);
router.post("/accept", protectRoute, acceptRequest);
router.post("/check-friendship", protectRoute, checkFriendshipStatus);

router.get("/list",protectRoute ,getFriends);
router.get("/requests/:userId",protectRoute, getFriendRequests);
// router.delete("/remove", protectRoute, removeFriend);

export default router;
