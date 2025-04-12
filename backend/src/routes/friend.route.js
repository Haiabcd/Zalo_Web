import express from "express";
import {
  sendRequest,
  remove,
  getFriends,
  acceptRequest,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/request", protectRoute, sendRequest);
router.post("/accept", protectRoute, acceptRequest);
router.get("/list", getFriends);

// router.delete("/remove", protectRoute, removeFriend);

export default router;
