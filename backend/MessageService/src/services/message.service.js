import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";

// Gửi tin nhắn
export const sendMessage = async (
  senderId,
  receiverId,
  messageType,
  content,
  file,
  folder
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
    const newMessageData = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      messageType,
      timestamp: new Date(),
    });

    if (messageType === "text") {
      newMessageData.content = content;
    } else if (messageType === "file" && file) {
      newMessageData.fileInfo = {
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || 0,
      };
    } else if (messageType === "folder" && folder) {
      newMessageData.folderInfo = {
        folderName: folder.folderName,
        files: folder.files.map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileSize: f.fileSize || 0,
        })),
      };
    }

    const newMessage = new Message(newMessageData);
    await newMessage.save();

    // Cập nhật tin nhắn cuối cùng
    conversation.lastMessage = {
      messageId: newMessage._id,
      content:
        messageType === "text"
          ? content
          : messageType === "file"
          ? file.fileName
          : folder.folderName,
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

// Lấy tin nhắn cuối cùng giữa 2 người
export const getLastMessageByParticipants = async (participants) => {
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: participants },
    }).populate("lastMessage.messageId");

    if (!conversation) {
      return { message: "Không tìm thấy cuộc trò chuyện nào!" };
    }

    return conversation.lastMessage;
  } catch (error) {
    throw new Error("Lỗi khi lấy tin nhắn cuối cùng: " + error.message);
  }
};
