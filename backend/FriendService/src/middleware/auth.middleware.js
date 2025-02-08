import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // 📌 Gửi request đến AuthService để kiểm tra token
    const authResponse = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/validate-token`,
      {},
      {
        headers: { Authorization: token },
      }
    );

    // Nếu AuthService xác nhận hợp lệ, gán user vào req
    req.user = authResponse.data.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
