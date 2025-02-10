import Friend from "../models/friends.model.js";
import redisClient from "../config/redisClient.js";
import axios from "axios";

// Gửi yêu cầu kết bạn
export const sendFriendRequest = async (userId, friendId) => {
  const existingRequest = await Friend.findOne({ userId, friendId });
  if (existingRequest)
    throw new Error("Đã gửi yêu cầu kết bạn. Vui lòng chờ phản hồi.");

  const newRequest = new Friend({ userId, friendId, status: "pending" });
  return await newRequest.save();
};

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (userId, friendId) => {
  const request = await Friend.findOne({
    userId: friendId,
    friendId: userId,
    status: "pending",
  });
  if (!request) throw new Error("Không tìm thấy lời mời kết bạn.");

  request.status = "accepted";
  await request.save();

  const newFriendship = new Friend({ userId, friendId, status: "accepted" });
  return await newFriendship.save();
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
    // 🛑 Lấy token từ cookies
    console.log("req.cookies: ", req.cookies);
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error("Không có token, vui lòng đăng nhập lại!");
    }

    // 🔴 Gọi API đến AuthService với token
    const { data: usersData } = await axios.post(
      "http://localhost:5001/api/auth/get-user",
      { userIds: friendIds },
      {
        headers: { Authorization: `Bearer ${token}` }, // Gửi token trong headers
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
    return friends; // Nếu lỗi, trả về danh sách bạn bè nhưng không có thông tin user
  }
};
