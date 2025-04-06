import User from "../models/users.model.js";
// Middleware kiểm tra người dùng có đang active không
export const checkActiveStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị đăng xuất hoặc bị khóa" });
    }

    next();
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
