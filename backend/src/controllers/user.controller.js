import { getUserByPhone } from "../services/user.service.js";

export const handleGetUserByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const userId = req.user._id;

    const user = await getUserByPhone(phone, userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi getUserByPhone:", error.message);
    res.status(500).json({ message: "Đã có lỗi xảy ra." });
  }
};
