import Conversation from "../models/conversations.model.js";
import cloudinary from "../configs/cloudinary.js";
import { io, userSockets } from "../utils/socket.js";
import { Types } from "mongoose";
import User from "../models/users.model.js";

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
      .sort({ latestActivityTime: -1 }) // Cuộc trò chuyện mới nhất sẽ ở đầu danh sách
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
      let latestActivityTime = conversation.latestActivityTime;

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
        latestActivityTime,
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

//ĐỂ cập nhật trạng thái seen cho tin nhắn
export const resetUnseenCount = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const updated = await Conversation.findOneAndUpdate(
    { _id: conversationId, "unseenCount.user": userId },
    {
      $set: {
        "unseenCount.$.count": 0,
      },
    },
    { new: true }
  ).populate("participants", "name");

  return updated;
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

export const createGroup = async (
  groupName,
  participantIds,
  creatorId,
  groupAvatarBuffer
) => {
  try {
    // Chuẩn hóa participantIds
    let parsedParticipantIds;
    if (typeof participantIds === "string") {
      try {
        parsedParticipantIds = JSON.parse(participantIds);
      } catch (error) {
        throw new Error(
          "participantIds là chuỗi JSON không hợp lệ: " + error.message
        );
      }
    } else {
      parsedParticipantIds = participantIds;
    }

    // Kiểm tra participantIds là mảng
    if (!Array.isArray(parsedParticipantIds)) {
      throw new Error("participantIds phải là một mảng các ID thành viên.");
    }

    // Kiểm tra participantIds không rỗng
    if (parsedParticipantIds.length === 0) {
      throw new Error("participantIds không được rỗng.");
    }

    // Chuẩn hóa creatorId thành chuỗi hex
    const creatorIdString =
      creatorId instanceof Types.ObjectId
        ? creatorId.toString()
        : String(creatorId).trim();

    // Kiểm tra định dạng creatorId
    if (!creatorIdString.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error(`Invalid creatorId: ${creatorIdString}`);
    }

    // Validate and create unique participant IDs
    const uniqueParticipantIds = Array.from(
      new Set([
        ...parsedParticipantIds.map((id) => String(id).trim()),
        creatorIdString,
      ])
    );

    // Kiểm tra số lượng thành viên tối thiểu
    if (uniqueParticipantIds.length < 3) {
      throw new Error("Nhóm phải có ít nhất 3 thành viên (bao gồm người tạo).");
    }

    // Validate and convert to ObjectId
    const participantObjectIds = uniqueParticipantIds.map((id, index) => {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid ObjectId tại vị trí ${index}: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    // Verify all users exist
    const users = await User.find({ _id: { $in: participantObjectIds } });
    if (users.length !== participantObjectIds.length) {
      throw new Error("Một hoặc nhiều ID thành viên không hợp lệ.");
    }

    // Create group name if not provided
    let finalGroupName = groupName?.trim();
    if (!finalGroupName) {
      const memberNames = users.map((user) => user.fullName);
      finalGroupName = memberNames.join(", ");
    }

    // Handle group avatar upload
    let groupAvatarUrl = "";
    if (groupAvatarBuffer) {
      const uploadResult = await uploadFileToCloudinary(groupAvatarBuffer);
      groupAvatarUrl = uploadResult.secure_url;
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: participantObjectIds,
      isGroup: true,
      groupName: finalGroupName,
      groupAvatar: groupAvatarUrl,
      admin: new Types.ObjectId(creatorIdString),
      unseenCount: participantObjectIds.map((userId) => ({
        user: userId,
        count: 0,
      })),
      latestActivityTime: Date.now(),
    });

    // Populate conversation
    const populatedConversation = await Conversation.findById(
      newConversation._id
    );

    // Emit to group members
    participantObjectIds.forEach((userId) => {
      const userSocket = userSockets.get(userId.toString());
      if (userSocket) {
        if (userSocket.web) {
          io.to(userSocket.web).emit("createGroup", populatedConversation);
        }
        if (userSocket.app) {
          io.to(userSocket.app).emit("createGroup", populatedConversation);
        }
      }
    });

    return populatedConversation;
  } catch (error) {
    console.error("Error creating group:", error.message, {
      participantIds,
      creatorId,
    });
    throw new Error(`Failed to create group: ${error.message}`);
  }
};
//Thêm thành viên
export const addMembersToGroup = async (conversationId, newMemberIds) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Cuộc trò chuyện không tồn tại.");
    }

    // Kiểm tra nếu thành viên đã tồn tại trong nhóm
    const existingMembers = conversation.participants.map((participant) =>
      participant.toString()
    );
    const newMembersToAdd = newMemberIds.filter(
      (id) => !existingMembers.includes(id)
    );

    // Kiểm tra nếu không có thành viên nào mới
    if (newMembersToAdd.length === 0) {
      throw new Error("Không có thành viên mới để thêm.");
    }

    // Thêm thành viên mới vào nhóm
    conversation.participants.push(...newMembersToAdd);

    conversation.latestActivityTime = Date.now();

    const updatedConversation = await conversation.save();

    // Gửi thông báo cho tất cả thành viên trong nhóm qua Socket
    const allMembers = [...conversation.participants, ...newMembersToAdd];
    allMembers.forEach((userId) => {
      const userSocket = userSockets.get(userId.toString());
      if (userSocket) {
        if (userSocket.web) {
          io.to(userSocket.web).emit("groupUpdated", updatedConversation);
        }
        if (userSocket.app) {
          io.to(userSocket.app).emit("groupUpdated", updatedConversation);
        }
      }
    });

    return updatedConversation;
  } catch (error) {
    throw new Error(`Không thể thêm thành viên: ${error.message}`);
  }
};
