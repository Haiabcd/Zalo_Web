import {
  getUserConversations,
  getConversationById,
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
