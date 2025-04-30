import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token =
      req.cookies?.accessToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    //
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra token có còn hợp lệ không
    // if (
    //   (user.webToken && user.webToken !== token) ||
    //   (user.appToken && user.appToken !== token)
    // ) {
    //   return res
    //     .status(401)
    //     .json({ message: "Phiên đăng nhập đã bị đăng xuất từ thiết bị khác" });
    // }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
