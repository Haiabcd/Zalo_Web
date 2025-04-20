import Conversation from "../models/conversations.model.js";

//Lây danh sách các cuộc trò chuyện (sắp xếp theo thời gian)
export const getUserConversations = async (userId) => {
  try {
    //Tìm tất cả Conversation mà userId có mặt trong mảng participants
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullName profilePic lastSeen isActive",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId type",
        populate: {
          path: "senderId",
          select: "fullName",
        },
      })
      .sort({ updatedAt: -1 }) // Cuộc trò chuyện mới nhất sẽ ở đầu danh sách
      .lean(); // Chuyển đổi sang đối tượng JavaScript thuần túy

    //Duyệt qua từng cuộc trò chuyện để xử lý
    const processedConversations = conversations.map((conversation) => {
      // Tìm số tin nhắn chưa xem của người dùng
      const unseenInfo = conversation.unseenCount.find(
        (item) => item.user.toString() === userId.toString()
      );
      const unseenCount = unseenInfo ? unseenInfo.count : 0;

      let recipient = null; //biến lưu người nhận tin nhắn
      let conversationName = conversation.groupName;
      let conversationAvatar = conversation.groupAvatar;

      if (!conversation.isGroup) {
        //Nếu không phải groupd thì lấy người không phải userId
        recipient = conversation.participants.find(
          (participant) => participant._id.toString() !== userId.toString()
        );
        conversationName = recipient?.fullName || "";
        conversationAvatar = recipient?.profilePic || "";
      }

      //Kiểm tra xem người nhận có đang online hay không
      const isRecipientOnline = recipient?.isActive || false;

      return {
        _id: conversation._id,
        isGroup: conversation.isGroup,
        name: conversationName,
        groupName: conversation.groupName || "",
        avatar: conversationAvatar,
        lastMessage: conversation.lastMessage
          ? {
              _id: conversation.lastMessage._id,
              content: conversation.lastMessage.content,
              sender: conversation.lastMessage.senderId,
              type: conversation.lastMessage.type,
              timestamp: conversation.lastMessage.createdAt,
            }
          : null,
        unseenCount,
        updatedAt: conversation.updatedAt,
        recipient: recipient
          ? {
              _id: recipient._id,
              fullName: recipient.fullName,
              profilePic: recipient.profilePic,
              isOnline: isRecipientOnline,
              lastSeen: recipient.lastSeen,
            }
          : null,
        participants: conversation.participants,
      };
    });

    return processedConversations;
  } catch (error) {
    console.error("Error in conversationService.getUserConversations:", error);
    throw new Error("Không thể lấy danh sách cuộc trò chuyện");
  }
};

//Tạo conversation (cuộc trò chuyện của 2 người)
export const createConversation = async (userId1, userId2) => {
  const existing = await Conversation.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
    isGroup: false,
  });

  if (existing) return existing;

  const newConversation = new Conversation({
    participants: [userId1, userId2],
    isGroup: false,
    groupName: "",
    groupAvatar: "",
    unseenCount: [
      { user: userId1, count: 0 },
      { user: userId2, count: 0 },
    ],
  });

  await newConversation.save();
  return newConversation;
};

//Lấy thông tin cuộc trò chuyện theo ID
export const getConversationById = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "participants",
        select: "fullName profilePic lastSeen isActive",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId type",
        populate: {
          path: "senderId",
          select: "fullName",
        },
      })
      .lean();

    if (!conversation) {
      throw new Error("Cuộc trò chuyện không tồn tại");
    }

    const unseenInfo = conversation.unseenCount.find(
      (item) => item.user.toString() === userId.toString()
    );
    const unseenCount = unseenInfo ? unseenInfo.count : 0;

    let recipient = null;
    let conversationName = conversation.groupName;
    let conversationAvatar = conversation.groupAvatar;

    if (!conversation.isGroup) {
      recipient = conversation.participants.find(
        (participant) => participant._id.toString() !== userId.toString()
      );
      conversationName = recipient?.fullName || "";
      conversationAvatar = recipient?.profilePic || "";
    }

    const isRecipientOnline = recipient?.isActive || false;

    return {
      _id: conversation._id,
      isGroup: conversation.isGroup,
      name: conversationName,
      groupName: conversation.groupName || "",
      avatar: conversationAvatar,
      lastMessage: conversation.lastMessage
        ? {
            _id: conversation.lastMessage._id,
            content: conversation.lastMessage.content,
            sender: conversation.lastMessage.senderId,
            type: conversation.lastMessage.type,
            timestamp: conversation.lastMessage.createdAt,
          }
        : null,
      unseenCount,
      updatedAt: conversation.updatedAt,
      recipient: recipient
        ? {
            _id: recipient._id,
            fullName: recipient.fullName,
            profilePic: recipient.profilePic,
            isOnline: isRecipientOnline,
            lastSeen: recipient.lastSeen,
          }
        : null,
      participants: conversation.participants,
    };
  } catch (error) {
    console.error("Lỗi trong getConversationById:", error);
    throw new Error("Không thể lấy thông tin cuộc trò chuyện");
  }
};
