import {
  createMessage,
  getMessagesByConversationId,
} from "../services/message.service.js";

//Gửi tin nhắn (chat text + emoji)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    const message = await createMessage({
      conversationId,
      senderId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn text:", error);
    res
      .status(
        error.message === "Không tìm thấy cuộc trò chuyện" ||
          error.message === "Người dùng không có trong cuộc trò chuyện"
          ? 403
          : 500
      )
      .json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { beforeMessageId, limit = 50 } = req.query;

    const messages = await getMessagesByConversationId(
      conversationId,
      userId,
      beforeMessageId,
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
