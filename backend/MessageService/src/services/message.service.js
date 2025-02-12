import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";

// Gửi tin nhắn
export const sendMessage = async (
  senderId,
  receiverId,
  messageType,
  content
) => {
  try {
    // Kiểm tra cuộc trò chuyện có tồn tại không
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // Nếu không có, tạo mới
    if (!conversation) {
      conversation = new Conversation({ participants: [senderId, receiverId] });
      await conversation.save();
    }

    // Tạo tin nhắn mới
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      messageType,
      content,
    });

    await newMessage.save();

    // Cập nhật tin nhắn cuối cùng
    conversation.lastMessage = {
      messageId: newMessage._id,
      content,
      timestamp: newMessage.timestamp,
    };
    conversation.updatedAt = Date.now();
    await conversation.save();

    return newMessage;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy tin nhắn giữa 2 người
export const getMessagesBetweenUsers = async (userId1, userId2) => {
  try {
    // 1. Kiểm tra xem cuộc hội thoại giữa 2 người có tồn tại không
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (!conversation) {
      return []; // Không có cuộc hội thoại => không có tin nhắn
    }

    // 2. Lấy tin nhắn trong cuộc hội thoại
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 }); // Sắp xếp theo thời gian

    return messages;
  } catch (error) {
    throw new Error("Lỗi khi lấy tin nhắn: " + error.message);
  }
};
