import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import moment from "moment";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUsersByIds } from "../services/user.service.js";
import twilio from "twilio";

dotenv.config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioServiceId = process.env.TWILIO_VERIFY_SERVICE_SID; 

export const signup = async (req, res) => {
  // lấy dữ liệu từ req.body
  const { fullName, password, phoneNumber, gender, dateOfBirth, otp } = req.body;
  try {
    if (!fullName || !password || !phoneNumber || !gender || !dateOfBirth || !otp) {
      return res.status(400).json({ message: "Không được bỏ trống" });
    }

    // Kiểm tra OTP với Twilio Verify
    const verificationCheck = await twilioClient.verify.v2.services(twilioServiceId)
      .verificationChecks
      .create({ to: phoneNumber, code: otp });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ message: "Số điện thoại đã tồn tại" });

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new User({
      fullName,
      password: hashedPassword,
      phoneNumber,
      gender,
      dateOfBirth: new Date(dateOfBirth),
    });

    await newUser.save();
    
    res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: newUser,
    });

  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Gửi OTP qua Twilio Verify
export const requestOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Số điện thoại là bắt buộc" });

  try {
    await twilioClient.verify.v2.services(twilioServiceId)
      .verifications
      .create({ to: phoneNumber, channel: "sms" }).then(verification => console.log(verification.sid));;

    res.json({ message: "OTP đã được gửi thành công" });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ error: "Không thể gửi OTP" });
  }
};

// Xác minh OTP qua Twilio Verify
export const verifyUserOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) return res.status(400).json({ error: "Số điện thoại và OTP là bắt buộc" });

  try {
    const verificationCheck = await twilioClient.verify.v2.services(twilioServiceId)
      .verificationChecks
      .create({ to: phoneNumber, code: otp });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ error: "OTP không hợp lệ" });
    }

    res.json({ message: "OTP xác minh thành công" });
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    res.status(500).json({ error: "Không thể xác minh OTP" });
  }
};

export const login = async (req, res) => {
  //Lấy dữ liệu từ client
  const { phoneNumber, password } = req.body;
  try {
    //Tìm kiếm user theo số điện thoại
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tôn tại" });
    }
    //Kiểm tra password
    const isPasswordCorrect = await bcrypt.compare(password, user.password); //T OR F
    if (!isPasswordCorrect) {
      //false
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    //Tạo token
    const token = generateToken(user._id, res);

    res.cookie("accessToken", token, {
      httpOnly: true, // Không thể truy cập từ JavaScript (bảo mật)
      secure: false, // Chỉ chạy trên HTTPS nếu ở production
      sameSite: "None", // Cho phép gửi cookie giữa frontend và backend khác domain
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
      },
    });
  } catch (error) {
    console.log("Lỗi ở chức năng Login", error.message);
    res.status(500).json({ message: "Lỗi controller login" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); //Xóa cookie
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.log("Lỗi ở chức năng Logout", error.message);
    res.status(500).json({ message: "Lỗi controller logout" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Không tìm thấy ảnh" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Lỗi cập nhật ảnh đại diện:", error);
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
