import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    httpOnly: true, // // Ngăn truy cập từ JavaScript
    sameSite: "strict",  // Ngăn chặn các truy cập từ các trang web khác
    secure: process.env.NODE_ENV !== "development", //cho phép gửi qua  htpp và https (AN TOÀN)
  });

  return token;
};