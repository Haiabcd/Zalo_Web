import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendsList,
} from "../services/friend.service.js";
import { createConversation } from "../services/conversation.service.js";
import {
  emitFriendRequest,
  emitFriendRequestAccepted,
} from "../utils/socket.js";
import { formatPhoneNumber } from "../utils/formatPhoneNumber.js";

// Gửi lời mời kết bạn
export const sendRequest = async (req, res) => {
  const { phoneNumber } = req.body;
  const senderId = req.user._id;

  try {
    //Chuyen đổi số điện thoại
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const friendRequest = await sendFriendRequest(
      senderId,
      formattedPhoneNumber
    );

    emitFriendRequest(friendRequest.user2, {
      requestId: friendRequest._id,
      senderId,
      createdAt: friendRequest.createdAt,
    });

    return res.status(200).json({
      success: true,
      message: "Gửi yêu cầu kết bạn thành công",
      data: friendRequest,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Chấp nhận lời mời kết bạn
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const friendRequest = await acceptFriendRequest(requestId, userId);

    //Tạo cuộc trò chuyện rỗng giữa 2 người
    const otherUserId =
      friendRequest.user1.toString() === userId.toString()
        ? friendRequest.user2
        : friendRequest.user1;

    await createConversation(userId, otherUserId);

    // Emit socket event to sender
    emitFriendRequestAccepted(friendRequest.user1, {
      requestId: friendRequest._id,
      accepterId: userId,
      updatedAt: friendRequest.updatedAt,
    });

    return res.status(200).json({
      success: true,
      message: "Chấp nhận yêu cầu kết bạn thành công",
      data: friendRequest,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//chưa sửa
export const remove = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    await removeFriend(userId, friendId);
    res.status(200).json({ message: "Friend removed." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//chưa sửa
export const getFriends = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "Thiếu userId, vui lòng đăng nhập lại!" });
    }

    const friends = await getFriendsList(req, userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ message: "Lỗi lấy danh sách bạn bè", error });
  }
};
