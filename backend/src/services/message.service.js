import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";
import { io, userSockets } from "../utils/socket.js";

// Tạo tin nhắn mới (text)
export const createMessage = async ({ conversationId, senderId, content }) => {
  // Kiểm tra conversation có tồn tại
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  // Kiểm tra user có trong conversation
  if (!conversation.participants.includes(senderId)) {
    throw new Error("Người dùng không có trong cuộc trò chuyện");
  }

  // Tạo tin nhắn mới
  const newMessage = new Message({
    conversationId,
    senderId,
    messageType: "text",
    content,
  });

  // Lưu tin nhắn
  await newMessage.save();

  // Populate thông tin cần thiết
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("senderId", "fullName profilePic")
    .lean();

  // Cập nhật unseenCount cho các participant trừ sender
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      unseenCount: conversation.participants.map((participant) => ({
        user: participant,
        count: participant.equals(senderId) ? 0 : 1, //Nếu là người gửi thì count = 0, ngược lại count = 1
      })),
    },
  });

  // Socket tin nhắn tới các participant
  conversation.participants.forEach((participantId) => {
    //Duyệt qua từng participant trong cuộc trò chuyện
    if (!participantId.equals(senderId)) {
      //Nếu không phải là người gửi thì gửi tin nhắn
      const userSocket = userSockets.get(participantId.toString());
      if (userSocket) {
        //Nếu người dùng đang onl thì mới gửi tin nhắn
        if (userSocket.web) {
          io.to(userSocket.web).emit("newMessage", populatedMessage);
        }
        if (userSocket.app) {
          io.to(userSocket.app).emit("newMessage", populatedMessage);
        }
      }
    }
  });

  return populatedMessage;
};

//Lấy tin nhắn theo conversationId
export const getMessagesByConversationId = async (
  conversationId,
  userId,
  beforeMessageId = null,
  limit = 50
) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Không tìm thấy cuộc trò chuyện");
    }
    if (!conversation.participants.includes(userId)) {
      throw new Error("Người dùng không có trong cuộc trò chuyện");
    }

    // Điều kiện query (chỉ lấy những tin nhắn chưa xóa bởi người dùng này)
    const query = {
      conversationId,
      $or: [
        { deleteFor: { $nin: [userId] } }, // người này KHÔNG nằm trong danh sách đã xóa
        { deleteFor: { $exists: false } }, // không có trường deleteFor
        { deleteFor: [] }, // trường deleteFor là mảng rỗng
      ],
    };

    // Nếu có beforeMessageId, lấy tin nhắn trước đó
    if (beforeMessageId) {
      const beforeMessage = await Message.findById(beforeMessageId);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt }; //lọc tin nhắn có createdAt < createdAt beforeMessage
      }
    }

    // Lấy tin nhắn
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Từ mới đến cũ
      .limit(limit)
      .populate("senderId", "fullName profilePic")
      .populate("seenBy.user", "fullName")
      .populate("reactions.user", "fullName")
      .lean();

    return messages.reverse(); // Đảo ngược để hiển thị từ cũ đến mới
  } catch (error) {
    throw new Error(error.message);
  }
};
