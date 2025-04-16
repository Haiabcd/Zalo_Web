import express from "express";
import {
  getConversations,
  getById,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getList", protectRoute, getConversations);
router.get("/:id", protectRoute, getById);

export default router;
