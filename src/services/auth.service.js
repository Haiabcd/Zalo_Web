import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { twilioClient, twilioServiceId } from "../configs/twillio.js";
const tempTokens = new Map();

export const signupService = async (data) => {
  const { fullName, password, phoneNumber, gender, dateOfBirth, tempToken } =
    data;

  if (!fullName || !password || !phoneNumber || !gender || !dateOfBirth) {
    return {
      status: 400,
      data: { message: "Không được bỏ trống" },
    };
  }

  if (!tempToken) {
    return {
      status: 400,
      data: { message: "Token không hợp lệ hoặc đã hết hạn" },
    };
  }

  const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  const verifiedPhoneNumber = decoded.phoneNumber;

  const existingUser = await User.findOne({ phoneNumber: verifiedPhoneNumber });
  if (existingUser) {
    return { status: 400, data: { message: "Số điện thoại đã tồn tại" } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    fullName,
    password: hashedPassword,
    phoneNumber: verifiedPhoneNumber,
    gender,
    dateOfBirth: new Date(dateOfBirth),
  });

  await newUser.save();

  return {
    status: 201,
    data: {
      message: "Tạo tài khoản thành công",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        gender: newUser.gender,
        dateOfBirth: newUser.dateOfBirth,
      },
    },
  };
};

export const requestOTPService = async (phoneNumber) => {
  try {
    await twilioClient.verify.v2
      .services(twilioServiceId)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    return { success: true, message: "OTP đã được gửi thành công" };
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    throw new Error("Không thể gửi OTP");
  }
};

export const verifyOTPService = async (phoneNumber, otp) => {
  try {
    if (process.env.NODE_ENV === "development" && otp === "123456") {
      const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      tempTokens.set(phoneNumber, tempToken);
      return { success: true, message: "OTP xác minh thành công", tempToken };
    }

    const verificationCheck = await twilioClient.verify.v2
      .services(twilioServiceId)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status !== "approved") {
      return { success: false, error: "OTP không hợp lệ" };
    }

    const tempToken = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    tempTokens.set(phoneNumber, tempToken);

    return { success: true, message: "OTP xác minh thành công", tempToken };
  } catch (error) {
    console.error("Lỗi xác minh OTP:", error);
    throw new Error("Không thể xác minh OTP");
  }
};
