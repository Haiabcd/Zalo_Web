import redisClient from "../configs/redisClient.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import Friend from "../models/friends.model.js";
import User from "../models/users.model.js";

// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (senderId, phoneNumber) => {
  const receiver = await User.findOne({ phoneNumber });

  if (!receiver) {
    throw new Error(
      "Số điện thoại chưa đăng ký tài khoản hoặc không cho phép tìm kiếm"
    );
  }

  if (senderId.toString() === receiver._id.toString()) {
    throw new Error("Không thể gửi yêu cầu kết bạn cho chính mình");
  }

  const existingRequest = await Friend.findOne({
    $or: [
      { actionUser: senderId, targetUser: receiver._id },
      { targetUser: receiver._id, actionUser: senderId },
    ],
  });

  if (existingRequest) {
    switch (existingRequest.status) {
      case "pending":
        throw new Error(
          "Bạn đã gửi yêu cầu kết bạn hoặc đã nhận yêu cầu từ người này"
        );
      case "accepted":
        throw new Error("Bạn đã là bạn bè với người này");
      case "blocked":
        throw new Error("Bạn đã bị chặn bởi người này");
    }
  }

  const newRequest = await Friend.create({
    actionUser: senderId,
    targetUser: receiver._id,
    status: "pending",
  });

  return newRequest;
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (requestId, userId) => {
  const friendRequest = await Friend.findById(requestId);

  if (!friendRequest) {
    throw new Error("Không tìm thấy yêu cầu kết bạn.");
  }

  if (friendRequest.status === "accepted") {
    throw new Error("Các bạn đã là bạn bè.");
  }

  if (friendRequest.status !== "pending") {
    throw new Error("Yêu cầu kết bạn không hợp lệ hoặc đã được xử lý");
  }

  if (friendRequest.targetUser.toString() === userId.toString()) {
    throw new Error("Bạn không có quyền chấp nhận yêu cầu này");
  }

  // Đổi chỗ actionUser và targetUser
  const oldActionUser = friendRequest.actionUser;
  friendRequest.actionUser = friendRequest.targetUser;
  friendRequest.targetUser = oldActionUser;
  friendRequest.status = "accepted";
  await friendRequest.save();

  return friendRequest;
};

// Hủy lời mời kết bạn hoặc xóa bạn
export const removeFriend = async (userId, friendId) => {
  return await Friend.deleteMany({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ],
  });
};

// Lấy danh sách bạn bè
export const getFriendsList = async (req, userId) => {
  const cacheKey = `friends:${userId}`;

  // 🟢 Kiểm tra Redis Cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("🔄 Lấy danh sách bạn bè từ cache Redis!");
    return JSON.parse(cachedData);
  }

  // 🟡 Lấy danh sách bạn bè từ DB
  const friends = await Friend.find({ userId, status: "accepted" });
  const friendIds = friends.map((friend) => friend.friendId);

  try {
    const token = req.cookies?.jwt;
    const cookies = req.headers.cookie; // 🟢 Lấy tất cả cookies

    if (!token) {
      console.log("Không có token, vui lòng đăng nhập lại!");
      return [];
    }

    // ✅ Kiểm tra token có hợp lệ không
    const decoded = jwt.decode(token);
    if (!decoded) {
      console.log("Token không hợp lệ hoặc đã hết hạn!");
      return [];
    }

    // 🔴 Gọi API đến AuthService với token + cookies
    const { data: usersData } = await axios.post(
      "http://localhost:5001/api/auth/get-user",
      { userIds: friendIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: cookies,
        },
        withCredentials: true,
      }
    );

    // 🟠 Gộp dữ liệu
    const friendsWithDetails = friends.map((friend) => ({
      ...friend.toObject(),
      friendInfo: usersData.find(
        (user) => user._id === friend.friendId.toString()
      ),
    }));

    // 🟢 Lưu vào Redis Cache
    await redisClient.set(cacheKey, JSON.stringify(friendsWithDetails), {
      EX: 3600,
    });

    return friendsWithDetails;
  } catch (error) {
    console.error("❌ Lỗi lấy user từ AuthService:", error.message);

    if (error.response?.status === 401) {
      console.log("⚠️ Token không hợp lệ hoặc hết hạn, cần đăng nhập lại!");
      return [];
    }
    return friends;
  }
};

// Tìm tất cả yêu cầu kết bạn của targetUserId với trạng thái "pending"
export const getPendingFriendRequests = async (targetUserId) => {
  try {
    const requests = await Friend.find({
      targetUser: targetUserId,
      status: "pending",
    })
      .populate("actionUser", "fullName profilePic")
      .exec();

    return {
      totalRequests: requests.length, 
      requests: requests, 
    };
  } catch (error) {
    throw new Error(
      "Không thể lấy danh sách yêu cầu kết bạn: " + error.message
    );
  }
};
