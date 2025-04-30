import {
  getUserConversations,
  getConversationById,
  resetUnseenCount,
  createGroup,
  addMembersToGroup,
  setGroupDeputy,
  deleteGroup,
  leaveGroup,
  removeMemberFromConversation,
  getConversationByFriend,
} from "../services/conversation.service.js";

//Lấy danh sách cuộc trò chuyện của người dùng
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await getUserConversations(userId);
    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cuộc trò chuyện",
      error: error.message,
    });
  }
};

//Lấy thông tin cuộc trò chuyện theo ID
export const getById = async (req, res) => {
  const userId = req.user._id;
  const conversationId = req.params.id;

  try {
    const conversation = await getConversationById(conversationId, userId);
    res.status(200).json(conversation);
  } catch (error) {
    console.error("Lỗi khi lấy conversation by ID:", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const handleResetUnseenCount = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  try {
    const updatedConversation = await resetUnseenCount(conversationId, userId);
    res.status(200).json({
      success: true,
      message: "Unseen count reset successfully",
      data: updatedConversation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset unseen count",
    });
  }
};

//Tạo nhóm
export const createGroupController = async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;
    const creatorId = req.user._id;
    const file = req.file;

    const newGroup = await createGroup(
      groupName,
      participantIds,
      creatorId,
      file
    );

    return res.status(200).json({
      success: true,
      message: "Tạo nhóm thành công.",
      data: newGroup,
    });
  } catch (error) {
    console.error("Error in createGroupController:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo nhóm.",
    });
  }
};

//Thêm thành viên vào nhóm
export const addMembersToGroupController = async (req, res) => {
  try {
    const { conversationId, newMemberIds } = req.body;

    // Gọi service để thêm thành viên vào nhóm
    const updatedConversation = await addMembersToGroup(
      conversationId,
      newMemberIds
    );

    return res.status(200).json({
      success: true,
      message: "Thêm thành viên vào nhóm thành công.",
      data: updatedConversation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể thêm thành viên vào nhóm.",
    });
  }
};

export const deleteGroupController = async (req, res) => {
  const { conversationId } = req.params;
  const actionUserId = req.user._id;

  try {
    const result = await deleteGroup(conversationId, actionUserId);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Lỗi server";
    return res.status(status).json({ message });
  }
};

export const leaveGroupController = async (req, res) => {
  const { conversationId, newLeader } = req.body;
  const userId = req.user._id;

  try {
    const updatedConversation = await leaveGroup(
      conversationId,
      userId,
      newLeader
    );
    return res.status(200).json({
      message: "Rời nhóm thành công",
      conversation: updatedConversation,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const setGroupDeputyController = async (req, res) => {
  const { conversationId, deputyId } = req.body;
  const userId = req.user._id;

  try {
    const updatedConversation = await setGroupDeputy(
      conversationId,
      userId,
      deputyId
    );
    return res.status(200).json({
      message: "Thiết lập phó nhóm thành công",
      conversation: updatedConversation,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  const { conversationId, memberId } = req.params;

  try {
    const result = await removeMemberFromConversation(conversationId, memberId);
    return res.status(result.status || 200).json({ message: result.message });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Lỗi server";
    return res.status(status).json({ message });
  }
};

export const getConversationByFriendController = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    const conversation = await getConversationByFriend(userId, friendId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};
