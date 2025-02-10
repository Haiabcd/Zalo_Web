import axios from "axios";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Lấy token từ cookies (hoặc có thể từ headers)

    if (!token) {
      return res
        .status(401)
        .json({ message: "Người dùng chưa đăng nhập hoặc đã đăng xuất" });
    }

    // Gửi yêu cầu xác thực token đến AuthService
    const authServiceUrl = "http://localhost:5001/api/auth/validate-token";

    const response = await axios.post(
      authServiceUrl,
      {},
      {
        headers: { Cookie: `jwt=${token}` },
      }
    );

    req.user = response.data.user;

    console.log("User info: ", req.user);

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    console.log("Error response: ", error.response?.data);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
};
