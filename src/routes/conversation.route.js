import express from "express";
import {
  getConversations,
  getById,
  handleResetUnseenCount,
  createGroupController,
  addMembersToGroupController,
  deleteGroupController,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/getList", protectRoute, getConversations);
router.get("/:id", protectRoute, getById);
router.post(
  "/:conversationId/reset-unseen",
  protectRoute,
  handleResetUnseenCount
);
router.post(
  "/createGroup",
  upload.single("groupAvatar"),
  protectRoute,
  createGroupController
);
router.post("/add-members", protectRoute, addMembersToGroupController);
router.delete("/delete-group/:conversationId", protectRoute, deleteGroupController);

export default router;
