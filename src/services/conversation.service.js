import Conversation from "../models/conversations.model.js";
import cloudinary from "../configs/cloudinary.js";
import { io, userSockets } from "../utils/socket.js";
import { Types } from "mongoose";
import User from "../models/users.model.js";
import Message from "../models/messages.model.js";

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
        groupLeader: conversation.groupLeader,
        groupDeputy: conversation.groupDeputy,
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
      groupLeader: conversation.groupLeader,
      groupDeputy: conversation.groupDeputy,
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
//Tạo group
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
      const uploadResult = await uploadFileToCloudinary(
        groupAvatarBuffer.buffer
      );
      groupAvatarUrl = uploadResult.secure_url;
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: participantObjectIds,
      isGroup: true,
      groupName: finalGroupName,
      groupAvatar: groupAvatarUrl,
      groupLeader: new Types.ObjectId(creatorIdString),
      groupDeputy: null,
      unseenCount: participantObjectIds.map((userId) => ({
        user: userId,
        count: 0,
      })),
      latestActivityTime: Date.now(),
    });

    // Populate conversation
    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate({
      path: "participants",
      select: "fullName profilePic",
    });

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

//Rời nhóm
export const leaveGroup = async (conversationId, userId, newLeader) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.isGroup) {
    throw new Error("Cuộc trò chuyện không tồn tại hoặc không phải nhóm.");
  }
  // Nếu người dùng không phải thành viên
  if (
    !convo.participants.map((id) => id.toString()).includes(userId.toString())
  ) {
    throw new Error("Bạn không phải thành viên của nhóm này.");
  }

  // Xử lý trưởng nhóm rời đi
  if (convo.groupLeader?.toString() === userId.toString()) {
    if (!newLeader) {
      throw new Error("Vui lòng chỉ định trưởng nhóm mới trước khi rời.");
    }
    // Kiểm tra newLeader có phải thành viên của nhóm
    if (
      !convo.participants
        .map((id) => id.toString())
        .includes(newLeader.toString())
    ) {
      throw new Error("Trưởng nhóm mới phải là thành viên của nhóm.");
    }
    convo.groupLeader = newLeader;
    // Nếu newLeader đang là phó nhóm, xóa phó nhóm
    if (convo.groupDeputy?.toString() === newLeader.toString()) {
      convo.groupDeputy = null;
    }
  }

  // Nếu phó nhóm rời đi
  if (convo.groupDeputy?.toString() === userId.toString()) {
    convo.groupDeputy = null;
  }

  // Lưu danh sách participants trước khi xóa để thông báo
  const allParticipants = [...convo.participants];

  // Xoá khỏi danh sách participants
  convo.participants = convo.participants.filter(
    (id) => id.toString() !== userId.toString()
  );

  // Xoá unseen count của người đó
  convo.unseenCount = convo.unseenCount.filter(
    (entry) => entry.user.toString() !== userId.toString()
  );

  await convo.save();

  // Thông báo cho các thành viên còn lại
  allParticipants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("leaveGroup", convo);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("leaveGroup", convo);
      }
    }
  });

  return convo;
};

//Set phó nhóm
export const setGroupDeputy = async (conversationId, userId, deputyId) => {
  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.isGroup) {
    throw new Error("Cuộc trò chuyện không tồn tại hoặc không phải nhóm.");
  }

  // Kiểm tra xem người yêu cầu có phải trưởng nhóm
  if (convo.groupLeader?.toString() !== userId.toString()) {
    throw new Error("Chỉ trưởng nhóm mới có thể chỉ định phó nhóm.");
  }

  // Kiểm tra xem deputyId có phải thành viên của nhóm
  if (
    !convo.participants.map((id) => id.toString()).includes(deputyId.toString())
  ) {
    throw new Error("Phó nhóm phải là thành viên của nhóm.");
  }

  // Kiểm tra xem deputyId có phải chính trưởng nhóm
  if (deputyId.toString() === convo.groupLeader.toString()) {
    throw new Error("Trưởng nhóm không thể được chỉ định làm phó nhóm.");
  }

  // Cập nhật phó nhóm
  convo.groupDeputy = deputyId;

  await convo.save();

  // Thông báo cho tất cả thành viên nhóm qua socket
  convo.participants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("updateGroupDeputy", convo);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("updateGroupDeputy", convo);
      }
    }
  });

  return convo;
};

//Xóa nhóm
export const deleteGroup = async (conversationId, actionUserId) => {
  const conversation = await Conversation.findById(conversationId);

  const allParticipants = [...conversation.participants];

  if (!conversation) {
    throw { status: 404, message: "Không tìm thấy nhóm" };
  }

  if (!conversation.isGroup) {
    throw { status: 400, message: "Đây không phải là nhóm" };
  }

  if (conversation.groupLeader.toString() !== actionUserId.toString()) {
    throw { status: 403, message: "Bạn không có quyền giải tán nhóm này" };
  }

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  // Thông báo cho các thành viên còn lại
  allParticipants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("leaveGroup", "Group đã bị xóa");
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("leaveGroup", "Group đã bị xóa");
      }
    }
  });

  return { status: 200, message: "Nhóm đã được giải tán" };
};

//Xóa thành viên khỏi nhóm
export const removeMemberFromConversation = async (
  conversationId,
  memberId
) => {
  const conversation = await Conversation.findById(conversationId);

  const allParticipants = [...conversation.participants];

  if (!conversation) {
    const error = new Error("Không tìm thấy cuộc trò chuyện");
    error.status = 404;
    throw error;
  }

  if (!conversation.isGroup) {
    const error = new Error(
      "Không thể xóa thành viên khỏi cuộc trò chuyện cá nhân"
    );
    error.status = 400;
    throw error;
  }

  conversation.participants = conversation.participants.filter(
    (id) => id.toString() !== memberId
  );

  conversation.unseenCount = conversation.unseenCount.filter(
    (entry) => entry.user.toString() !== memberId
  );

  await conversation.save();


  return { status: 200, message: "Đã xóa thành viên khỏi nhóm" };
};

export const getConversationByFriend = async (userId, friendId) => {
  return await Conversation.findOne({
    isGroup: false,
    participants: { $all: [userId, friendId] },
  }).populate("participants", "-password");
  // Thông báo cho các thành viên còn lại
  allParticipants.forEach((participantId) => {
    const userSocket = userSockets.get(participantId.toString());
    if (userSocket) {
      if (userSocket.web) {
        io.to(userSocket.web).emit("leaveGroup", conversation);
      }
      if (userSocket.app) {
        io.to(userSocket.app).emit("leaveGroup", conversation);
      }
    }
  });

  return { status: 200, message: "Đã xóa thành viên khỏi nhóm" };
};
