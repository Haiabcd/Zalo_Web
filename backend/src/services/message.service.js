import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";
import { io, userSockets } from "../utils/socket.js";

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
