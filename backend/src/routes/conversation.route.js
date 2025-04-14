import express from "express";
import { getConversations } from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getList", protectRoute, getConversations);

export default router;
