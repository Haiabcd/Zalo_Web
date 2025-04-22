import express from "express";
import {
  getConversations,
  getById,
  handleResetUnseenCount,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getList", protectRoute, getConversations);
router.get("/:id", protectRoute, getById);
router.post("/:conversationId/reset-unseen",protectRoute, handleResetUnseenCount);

export default router;
