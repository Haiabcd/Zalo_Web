import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import cloudinary from "../configs/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  getUsersByIds,
  updateProfileService,
} from "../services/user.service.js";
import axios from "axios";
import { io, userSockets } from "../utils/socket.js";
import { formatPhoneNumber } from "../utils/formatPhoneNumber.js";
import { twilioClient, twilioServiceId } from "../configs/twillio.js";
import {
  requestOTPService,
  signupService,
  verifyOTPService,
} from "../services/auth.service.js";

dotenv.config();
const tempTokens = new Map();

export const signup = async (req, res) => {
  try {
    const result = await signupService(req.body);
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Gửi OTP qua Twilio Verify
export const requestOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber)
    return res.status(400).json({ error: "Số điện thoại là bắt buộc" });

  const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
  }

  // Bypass Twilio trong môi trường phát triển
  if (process.env.NODE_ENV === "development") {
    return res.json({
      message: "OTP đã được gửi thành công",
      devOTP: "123456",
    });
  }

  try {
    const result = await requestOTPService(phoneNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Xác thực OTP
export const verifyUserOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Số điện thoại và OTP là bắt buộc" });
  }

  try {
    const result = await verifyOTPService(phoneNumber, otp);

    if (result.success) {
      res.json({ message: result.message, tempToken: result.tempToken });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { phoneNumber, password, deviceType } = req.body;

  try {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: formattedPhoneNumber });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    // Kiểm tra password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // Đăng xuất thiết bị cũ cùng loại
    if (deviceType === "web" && user.webToken) {
      // Gửi thông báo qua WebSocket tới thiết bị web cũ
      const userSocket = userSockets.get(user._id.toString());
      if (userSocket && userSocket.web) {
        io.to(userSocket.web).emit("forceLogout", {
          message: "Bạn đã bị đăng xuất do đăng nhập trên thiết bị web khác",
        });
      }
      user.webToken = null; // Vô hiệu hóa token của thiết bị web cũ
    } else if (deviceType !== "web" && user.appToken) {
      // Gửi thông báo qua WebSocket tới thiết bị app cũ
      const userSocket = userSockets.get(user._id.toString());
      if (userSocket && userSocket.app) {
        io.to(userSocket.app).emit("forceLogout", {
          message: "Bạn đã bị đăng xuất do đăng nhập trên thiết bị app khác",
        });
      }
      user.appToken = null; // Vô hiệu hóa token của thiết bị app cũ
    }

    await user.save();
    // Tạo token mới
    const token = generateToken(user._id, res);

    // Gán token mới
    if (deviceType === "web") {
      user.webToken = token;
    } else {
      user.appToken = token;
    }
    user.isActive = true;
    await user.save();

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        password_set: user.password_set,
        backgroundImage: user.backgroundImage,
        isActive: true,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.log("Lỗi ở chức năng Login", error.message);
    res.status(500).json({ message: "Lỗi controller login" });
  }
};

export const logout = async (req, res) => {
  const { deviceType } = req.body;

  try {
    const user = req.user;

    res.cookie("accessToken", "", { maxAge: 0 });

    if (deviceType === "web") {
      user.webToken = null;
    } else {
      user.appToken = null;
    }

    await user.save();

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.log("Lỗi ở chức năng Logout", error.message);
    res.status(500).json({ message: "Lỗi khi đăng xuất" });
  }
};

export const updateProfile = async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;
  try {
    const updatedUser = await updateProfileService(_id, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cần thêm update chung cho cả ảnh bìa//=============///
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Không tìm thấy ảnh" });
    }

    // Tải ảnh lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "zalo-folder" },
      async (error, result) => {
        if (error) {
          console.error("Lỗi upload Cloudinary:", error);
          return res.status(500).json({ message: "Lỗi upload ảnh" });
        }

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePic: result.secure_url },
          { new: true }
        );

        res.status(200).json(updatedUser);
      }
    );
    // Gửi buffer của ảnh vào Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Lỗi cập nhật ảnh đại diện:", error);
    res.status(500).json({ message: "Lỗi controller updateProfile" });
  }
};

// Kiểm tra user đã đăng nhập chưa
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Kiểm tra token hợp lệ và trả về thông tin user
export const validateToken = (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
};

// Lấy danh sách người dùng theo userIds
export const getUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ message: "Danh sách userIds không hợp lệ" });
    }

    const users = await getUsersByIds(userIds);

    res.json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//Update mật khẩu
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 6 || newPassword.length > 32) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có độ dài từ 6 đến 32 ký tự",
      });
    }

    // Kiểm tra mật khẩu có chứa chữ cái, số và ký tự đặc biệt không
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasLetters || !hasNumbers || !hasSpecialChars) {
      return res.status(400).json({
        message:
          "Mật khẩu mới phải chứa ít nhất một chữ cái, một số và một ký tự đặc biệt",
      });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// <<<=========================================Quên mật khẩu============================================//
export const forgotPasswordRequest = async (req, res) => {
  const { phoneNumber, captchaValue } = req.body;

  try {
    // Kiểm tra số điện thoại
    if (!phoneNumber) {
      return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
    }

    const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Kiểm tra số điện thoại có tồn tại không
    const existingUser = await User.findOne({ phoneNumber });
    if (!existingUser) {
      return res.status(404).json({ message: "Số điện thoại không tồn tại" });
    }

    // Xác minh reCAPTCHA
    const recaptchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY, // Secret Key của bạn
          response: captchaValue,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: "Xác minh reCAPTCHA thất bại" });
    }

    // Gửi OTP
    if (process.env.NODE_ENV === "development") {
      const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      tempTokens.set(phoneNumber, tempToken);
      return res.json({
        message: "reCAPTCHA xác minh thành công, OTP đã được gửi",
        devOTP: "123456",
        tempToken,
      });
    }

    await twilioClient.verify.v2
      .services(twilioServiceId)
      .verifications.create({ to: phoneNumber, channel: "sms" })
      .then((verification) => console.log(verification.sid));

    const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    tempTokens.set(phoneNumber, tempToken);

    res.status(200).json({
      message: "reCAPTCHA xác minh thành công, OTP đã được gửi",
      tempToken,
    });
  } catch (error) {
    console.error("Lỗi kiểm tra số điện thoại:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const verifyOTPForPasswordReset = async (req, res) => {
  const { phoneNumber, otp, tempToken } = req.body;

  try {
    if (!phoneNumber || !otp || !tempToken) {
      return res
        .status(400)
        .json({ message: "Số điện thoại, OTP và token là bắt buộc" });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.phoneNumber !== phoneNumber) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc không khớp với số điện thoại",
      });
    }

    if (process.env.NODE_ENV === "development" && otp === "123456") {
      tempTokens.delete(tempToken);
      return res.json({
        message: "OTP xác minh thành công, bạn có thể đặt lại mật khẩu",
        resetToken: tempToken,
      });
    }

    const verificationCheck = await twilioClient.verify.v2
      .services(twilioServiceId)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    tempTokens.delete(tempToken);

    res.status(200).json({
      message: "OTP xác minh thành công, bạn có thể đặt lại mật khẩu",
      resetToken: tempToken,
    });
  } catch (error) {
    console.error("Lỗi xác minh OTP cho đặt lại mật khẩu:", error);
    if (error.code === 20404) {
      return res.status(500).json({
        message: "Cấu hình Twilio không hợp lệ, vui lòng kiểm tra Service SID",
      });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const resetPassword = async (req, res) => {
  const { phoneNumber, newPassword, confirmPassword, resetToken } = req.body;

  try {
    if (!phoneNumber || !newPassword || !confirmPassword || !resetToken) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.phoneNumber !== phoneNumber) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc không khớp với số điện thoại",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    if (newPassword.length < 6 || newPassword.length > 32) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có độ dài từ 6 đến 32 ký tự",
      });
    }

    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasLetters || !hasNumbers || !hasSpecialChars) {
      return res.status(400).json({
        message:
          "Mật khẩu mới phải chứa ít nhất một chữ cái, một số và một ký tự đặc biệt",
      });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// ============================================Quên mật khẩu=========================================>>>//
