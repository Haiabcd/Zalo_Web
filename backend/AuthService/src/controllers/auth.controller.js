import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import moment from "moment";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  getUsersByIds,
  updateProfileService,
} from "../services/user.service.js";
import twilio from "twilio";

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioServiceId = process.env.TWILIO_VERIFY_SERVICE_SID;
const tempTokens = new Map(); // Chỉ lưu tạm thời để sign up

export const signup = async (req, res) => {
  const { fullName, password, phoneNumber, gender, dateOfBirth, tempToken } =
    req.body;

  try {
    if (!fullName || !password || !phoneNumber || !gender || !dateOfBirth) {
      return res.status(400).json({ message: "Không được bỏ trống" });
    }

    // Kiểm tra token tạm thời
    if (!tempToken) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Giải mã token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const verifiedPhoneNumber = decoded.phoneNumber;

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({
      phoneNumber: verifiedPhoneNumber,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      fullName,
      password: hashedPassword,
      phoneNumber: verifiedPhoneNumber,
      gender,
      dateOfBirth: new Date(dateOfBirth),
    });

    await newUser.save();

    // Xóa token tạm thời sau khi dùng xong
    tempTokens.delete(tempToken);

    res.status(201).json({
      message: "Tạo tài khoản thành công",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        gender: newUser.gender,
        dateOfBirth: newUser.dateOfBirth,
      },
    });
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

  // Kiểm tra số điện thoại có hợp lệ không
  const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
  }

  // Bypass Twilio trong môi trường phát triển===========>>>>>>>>>>>>>>>>>>>>>>>>
  if (process.env.NODE_ENV === "development") {
    return res.json({
      message: "OTP đã được gửi thành công",
      devOTP: "123456",
    });
  }
  //==========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  try {
    await twilioClient.verify.v2
      .services(twilioServiceId)
      .verifications.create({ to: phoneNumber, channel: "sms" })
      .then((verification) => console.log(verification.sid));

    res.json({ message: "OTP đã được gửi thành công" });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ error: "Không thể gửi OTP" });
  }
};

// Xác minh OTP qua Twilio Verify
export const verifyUserOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp)
    return res.status(400).json({ error: "Số điện thoại và OTP là bắt buộc" });

  try {
    //byPass OTP=======================================================>>>>>>>>>>>>>>>>>>>>>>>>>>
    if (process.env.NODE_ENV === "development" && otp === "123456") {
      const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      tempTokens.set(phoneNumber, tempToken);
      return res.json({ message: "OTP xác minh thành công", tempToken });
    }
    //=================================================================>>>>>>>>>>>>>>>>>>>>>>>>>
    const verificationCheck = await twilioClient.verify.v2
      .services(twilioServiceId)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ error: "OTP không hợp lệ" });
    }

    const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    tempTokens.set(phoneNumber, tempToken);

    res.json({ message: "OTP xác minh thành công", tempToken });
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    res.status(500).json({ error: "Không thể xác minh OTP" });
  }
};

export const login = async (req, res) => {
  //Lấy dữ liệu từ client
  const { phoneNumber, password } = req.body;

  console.log("Số điện thoại người dùng nhập: ", phoneNumber);
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
