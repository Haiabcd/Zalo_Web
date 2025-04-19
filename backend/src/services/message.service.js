import Message from "../models/messages.model.js";
import Conversation from "../models/conversations.model.js";
import { io, userSockets } from "../utils/socket.js";
import cloudinary from "../configs/cloudinary.js";

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

  await Conversation.findByIdAndUpdate(newMessage.conversationId, {
    $set: {
      lastMessage: newMessage._id,
      latestActivityTime: newMessage.createdAt,
    },
  });

  // Populate thông tin cần thiết
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("senderId", "fullName profilePic")
    .lean();

  // Cập nhật unseenCount cho các participant trừ sender
  await updateUnseenCount(conversationId, senderId);

  //Duyệt qua từng participant trong cuộc trò chuyện
  conversation.participants.forEach((participantId) => {
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

// Hàm cập nhật unseenCount cho các participant
export const updateUnseenCount = async (conversationId, senderId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

  const currentUnseen = conversation.unseenCount || [];

  const updatedUnseen = conversation.participants.map((participant) => {
    if (participant.equals(senderId)) {
      // Người gửi thì count = 0
      return { user: participant, count: 0 };
    }

    // Người nhận: lấy count cũ và cộng thêm 1
    const existing = currentUnseen.find((u) => u.user.equals(participant));
    const prevCount = existing?.count || 0;

    return { user: participant, count: prevCount + 1 };
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { unseenCount: updatedUnseen },
  });
};

// Hàm upload file lên Cloudinary
const uploadFileToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "zallo_uploads",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// Tạo tin nhắn với file hoặc ảnh
export const createFileMessage = async ({ conversationId, senderId, file }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

  if (!conversation.participants.includes(senderId)) {
    throw new Error("Người dùng không có trong cuộc trò chuyện");
  }

  const cloudinaryResult = await uploadFileToCloudinary(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  let messageType = "file";
  if (file.mimetype.startsWith("image/")) messageType = "image";
  else if (file.mimetype.startsWith("video/")) messageType = "video";
  else if (file.mimetype.startsWith("audio/")) messageType = "audio";
  else messageType = "file";

  const newMessage = new Message({
    conversationId,
    senderId,
    messageType,
    content: file.originalname,
    fileInfo: {
      fileName: file.originalname,
      fileUrl: cloudinaryResult.secure_url,
      fileSize: file.size,
      fileType: file.mimetype,
    },
  });

  await newMessage.save();

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("senderId", "fullName profilePic")
    .lean();

  // Cập nhật unseenCount cho các participant trừ sender
  await updateUnseenCount(conversationId, senderId);

  //Duyệt qua từng participant trong cuộc trò chuyện
  conversation.participants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("newMessage", populatedMessage);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("newMessage", populatedMessage);
      }
    }
  });

  return populatedMessage;
};

// Tạo tin nhắn với thư mục chứa nhiều file
export const createFolderMessage = async ({
  conversationId,
  senderId,
  folderName,
  files,
}) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

  if (!conversation.participants.includes(senderId)) {
    throw new Error("Người dùng không có trong cuộc trò chuyện");
  }

  // Tải tất cả file lên Cloudinary đồng thời
  const uploadPromises = files.map((file) =>
    uploadFileToCloudinary(file.buffer)
  );
  const cloudinaryResults = await Promise.all(uploadPromises);

  // Thu thập thông tin file từ kết quả tải lên
  const folderFiles = cloudinaryResults.map((result, index) => ({
    fileName: files[index].originalname,
    fileUrl: result.secure_url,
    fileSize: files[index].size,
    fileType: files[index].mimetype,
  }));

  // Tạo tin nhắn mới với messageType: "folder"
  const newMessage = new Message({
    conversationId,
    senderId,
    messageType: "folder",
    content: folderName, // Nội dung là tên thư mục
    folderInfo: {
      folderName,
      files: folderFiles,
    },
  });

  await newMessage.save();

  // Populate thông tin tin nhắn
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("senderId", "fullName profilePic")
    .lean();

  // Cập nhật unseenCount cho các thành viên trừ người gửi
  await updateUnseenCount(conversationId, senderId);

  // Gửi tin nhắn qua socket tới các thành viên
  conversation.participants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("newMessage", populatedMessage);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("newMessage", populatedMessage);
      }
    }
  });

  return populatedMessage;
};

// Thu hồi tin nhắn
export const recallMessage = async ({ messageId, userId }) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Không tìm thấy tin nhắn");
  }

  if (String(message.senderId) !== String(userId)) {
    throw new Error("Bạn không có quyền thu hồi tin nhắn này");
  }

  const conversation = await Conversation.findById(message.conversationId);

  // Cập nhật trạng thái
  message.status = "recalled";
  message.content = ""; // Xoá nội dung
  message.messageType = "text";
  message.fileInfo = undefined;
  message.folderInfo = undefined;
  await message.save();

  //gửi tin nhắn thu hồi qua socket tới các thành viên
  conversation.participants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("newMessage", message);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("newMessage", message);
      }
    }
  });

  return message;
};

//Xóa tin nhắn chỉ cho mình
export const deleteMessageForMe = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Không tìm thấy tin nhắn");

  // Nếu người dùng đã xóa trước đó rồi thì thôi
  if (!message.deleteFor.includes(userId)) {
    message.deleteFor.push(userId);
    await message.save();
  }

  // Gửi tin nhắn đã xóa qua socket tới các thành viên
  const userSocket = userSockets.get(userId.toString());
  if (userSocket) {
    if (userSocket.web) {
      io.to(userSocket.web).emit("newMessage", message);
    }
    if (userSocket.app) {
      io.to(userSocket.app).emit("newMessage", message);
    }
  }

  return { message, deletedFor: userId };
};

// Hàm chuyển tiếp tin nhắn
export const forwardMessageService = async (
  originalMessageId,
  senderId,
  targetConversationIds
) => {
  const originalMessage = await Message.findById(originalMessageId);
  if (!originalMessage) {
    throw new Error("Original message not found");
  }

  const forwardedMessages = [];

  for (const convoId of targetConversationIds) {
    const newMessageData = {
      conversationId: convoId,
      senderId,
      messageType: originalMessage.messageType,
      content: originalMessage.content,
      fileInfo: originalMessage.fileInfo,
      folderInfo: originalMessage.folderInfo,
      status: "sent",
      seenBy: [],
      reactions: [],
      deleteFor: [],
    };

    const newMessage = new Message(newMessageData);
    await newMessage.save(); // This also updates the conversation's lastMessage via post('save') middleware

    forwardedMessages.push(newMessage);
  }

  return forwardedMessages;
};
