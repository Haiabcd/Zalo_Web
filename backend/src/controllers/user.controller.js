import { formatPhoneNumber } from "../utils/formatPhoneNumber.js";
import { findUserByPhoneNumber } from "../services/user.service.js";

export const getUserByPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Thiếu số điện thoại" });
  }

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  try {
    const user = await findUserByPhoneNumber(formattedPhoneNumber);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi tìm kiếm user:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
