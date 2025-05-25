import express from "express";
import {
  getConversations,
  getById,
  handleResetUnseenCount,
  createGroupController,
  addMembersToGroupController,
  leaveGroupController,
  setGroupDeputyController,
  deleteGroupController,
  removeMember,
  getConversationByFriendController,
  removeGroupDeputyController,
  setGroupLeaderController,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/getList", protectRoute, getConversations);
router.get("/:id", protectRoute, getById);
router.get(
  "/get-friend-conversation/:friendId",
  protectRoute,
  getConversationByFriendController
);
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
router.delete(
  "/delete-group/:conversationId",
  protectRoute,
  deleteGroupController
);
router.post("/leave-group", protectRoute, leaveGroupController);
router.delete(
  "/:conversationId/remove-member/:memberId",
  protectRoute,
  removeMember
);
router.post("/set-group-deputy", protectRoute, setGroupDeputyController);
router.post("/remove-group-deputy", protectRoute, removeGroupDeputyController);
router.post("/set-group-leader", protectRoute, setGroupLeaderController);

export default router;
