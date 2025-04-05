import User from "../models/users.model.js";

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
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!updatedUser) {
          throw new Error('User not found');
      }
      return updatedUser;
  } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
  }
};