import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000), // Thêm thời gian phát hành (issued at)
    random: Math.random().toString(36).substring(2), // Thêm giá trị ngẫu nhiên
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("accessToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "None", // Hỗ trợ cross-site requests
    secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS trong production
  });

  return token;
};
