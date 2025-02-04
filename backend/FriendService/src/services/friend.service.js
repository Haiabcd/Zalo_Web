const Friend = require("../models/friends.model");

// Gửi yêu cầu kết bạn
const sendFriendRequest = async (userId, friendId) => {
  const existingRequest = await Friend.findOne({ userId, friendId });
  if (existingRequest) throw new Error("Request already sent.");

  const newRequest = new Friend({ userId, friendId, status: "pending" });
  return await newRequest.save();
};

// Chấp nhận lời mời kết bạn
const acceptFriendRequest = async (userId, friendId) => {
  const request = await Friend.findOne({
    userId: friendId,
    friendId: userId,
    status: "pending",
  });
  if (!request) throw new Error("No request found.");

  request.status = "accepted";
  await request.save();

  const newFriendship = new Friend({ userId, friendId, status: "accepted" });
  return await newFriendship.save();
};

// Hủy lời mời kết bạn hoặc xóa bạn
const removeFriend = async (userId, friendId) => {
  return await Friend.deleteMany({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ],
  });
};

// Lấy danh sách bạn bè
const getFriendsList = async (userId) => {
  return await Friend.find({ userId, status: "accepted" }).populate(
    "friendId",
    "fullName profilePic"
  );
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendsList,
};
