import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import moment from "moment";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUsersByIds } from "../services/user.service.js";

dotenv.config();

export const signup = async (req, res) => {
  // lấy dữ liệu từ req.body
  const { fullName, password, phoneNumber, gender, dateOfBirth } = req.body;
  try {
    if (!fullName || !password || !phoneNumber || !gender || !dateOfBirth) {
      return res.status(400).json({ message: "Không được bỏ trống" });
    }

    // Kiểm tra password phải từ 6 đến 32 ký tự
    if (password.length < 6 || password.length > 32) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có độ dài từ 6 đến 32 ký tự" });
    }

    // Kiểm tra mật khẩu chứa chữ, số và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,32}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Mật khẩu phải chứa ít nhất một chữ cái, một số và một ký tự đặc biệt",
      });
    }

    // Kiểm tra mật khẩu không chứa ngày sinh và tên đầy đủ
    if (password.includes(dateOfBirth) || password.includes(fullName)) {
      return res.status(400).json({
        message: "Mật khẩu không được chứa ngày sinh hoặc tên đầy đủ",
      });
    }

    // Kiểm tra số điện thoại đúng định dạng
    const phoneRegex = /^(0[0-9]{9})$/; // Định dạng số điện thoại Việt Nam
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Kiểm tra giới tính hợp lệ
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: "Giới tính không hợp lệ" });
    }

    // Kiểm tra tuổi phải >= 14
    const currentDate = moment();
    const birthDate = moment(dateOfBirth);
    const age = currentDate.diff(birthDate, "years");
    if (age < 14) {
      return res.status(400).json({ message: "Bạn phải ít nhất 14 tuổi" });
    }

    const user = await User.findOne({ phoneNumber });
    if (user)
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      password: hashedPassword,
      phoneNumber,
      gender,
      dateOfBirth: new Date(dateOfBirth),
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        message: "Tạo tài khoản thành công",
        data: newUser,
      });
      console.log("Tạo tài khoản thành công", newUser);
    } else {
      res.status(400).json({ message: "Tạo tài khoản thất bại" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Lỗi máy chủ" });
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
    generateToken(user._id, res);
    res.status(200).json({
      message: "Đăng nhập thành công",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
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
