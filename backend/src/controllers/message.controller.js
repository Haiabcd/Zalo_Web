import {
  createMessage,
  getMessagesByConversationId,
  createFileMessage,
  createFolderMessage,
  recallMessage,
  deleteMessageForMe,
  forwardMessageService,
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

//Gửi tin nhắn (file, ảnh)
export const sendFile = async (req, res) => {
  try {
    const { conversationId, senderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Chưa có file đính kèm." });
    }

    const message = await createFileMessage({ conversationId, senderId, file });

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi gửi file:", error);
    res.status(500).json({ message: error.message });
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

export const sendFolder = async (req, res) => {
  try {
    const { conversationId, folderName } = req.body;
    const senderId = req.user._id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có file nào trong thư mục." });
    }

    if (!folderName) {
      return res.status(400).json({ message: "Tên thư mục là bắt buộc." });
    }

    const message = await createFolderMessage({
      conversationId,
      senderId,
      folderName,
      files,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Lỗi gửi thư mục:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm thu hồi tin nhắn
export const handleRecallMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  try {
    const message = await recallMessage({ messageId, userId });
    res.status(200).json({ message, message: "Thu hồi tin nhắn thành công" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  try {
    let result;
    result = await deleteMessageForMe(messageId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Hàm chuyển tiếp tin nhắn
export const forwardMessage = async (req, res) => {
  try {
    const { originalMessageId, senderId, targetConversationIds } = req.body;

    const result = await forwardMessageService(
      originalMessageId,
      senderId,
      targetConversationIds
    );

    return res.status(200).json({
      message: "Messages forwarded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error forwarding message:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
