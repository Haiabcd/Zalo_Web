import { getUserConversations } from "../services/conversation.service.js";

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
