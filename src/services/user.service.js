import User from "../models/users.model.js";
import { checkIfFriends } from "../services/friend.service.js";
import { formatPhoneNumber } from "../utils/formatPhoneNumber.js";

// Hàm lấy danh sách người dùng theo ID
export const getUsersByIds = async (userIds) => {
  try {
    return await User.find({ _id: { $in: userIds } }).select("-password");
  } catch (error) {
    console.error("Lỗi truy vấn người dùng:", error);
    throw new Error("Không thể lấy danh sách người dùng");
  }
};

export const updateProfileService = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

export const getUserByPhone = async (phoneNumber, userId) => {
  try {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    // Tìm người dùng theo số điện thoại
    const user = await User.findOne({
      phoneNumber: formattedPhoneNumber,
    }).select("fullName profilePic phoneNumber gender _id dateOfBirth");

    if (!user || user === null) {
      throw new Error("Người dùng không tồn tại");
    }
    // Kiểm tra tình trạng bạn bè giữa userId và user._id
    const friendshipStatus = await checkIfFriends(userId, user._id);

    // Trả về cả thông tin người dùng và tình trạng bạn bè
    return {
      user: user,
      isFriend: friendshipStatus.isFriend,
      friendShipId: friendshipStatus._id,
      status: friendshipStatus.status,
      actionUser: friendshipStatus.actionUser,
      targetUser: friendshipStatus.targetUser,
      createdAt: friendshipStatus.createdAt,
      updatedAt: friendshipStatus.updatedAt,
    };
  } catch (error) {
    console.error("Error while getting user by phone:", error.message); // In ra lỗi nếu có
    throw new Error("Lỗi khi tìm kiếm người dùng theo số điện thoại");
  }
};
