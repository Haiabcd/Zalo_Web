import express from "express";
import {
  getConversations,
  getById,
  handleResetUnseenCount,
  createGroupController,
  leaveGroupController,
  addMembersToGroupController,
  setGroupDeputyController,
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
router.post("/leave-group", protectRoute, leaveGroupController);

router.post("/set-group-deputy", protectRoute, setGroupDeputyController);

export default router;
