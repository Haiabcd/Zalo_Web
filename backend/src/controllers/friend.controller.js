import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingFriendRequests,
  getFriendRelationship,
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

    emitFriendRequest(friendRequest.targetUser, {
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
    await createConversation(
      friendRequest.actionUser,
      friendRequest.targetUser
    );

    // Emit socket event to sender
    emitFriendRequestAccepted(friendRequest.targetUser, {
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

export const getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ route params
    const requests = await getPendingFriendRequests(userId);

    if (requests.length === 0) {
      return res.status(404).json({ message: "Không có yêu cầu kết bạn nào" });
    }

    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

export const getFriendStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const friendId = req.user._id;

    const relationship = await getFriendRelationship(friendId, userId);

    res.status(200).json({ data: relationship });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
