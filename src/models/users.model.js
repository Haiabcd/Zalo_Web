import mongoose from "mongoose";
import Conversation from "./conversations.model.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (value.length < 2 || value.length > 40) {
            return false;
          }
          const noNumbers = /^[^\d]+$/;
          if (!noNumbers.test(value)) {
            // Kiểm tra xem value có chứa số không
            return false;
          }
          const validName =
            /^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơưƯăâêôảơ ]+$/u;
          if (!validName.test(value)) {
            console.error("Tên không hợp lệ:", value);
            return false;
          }
          return true;
        },
        message:
          "Full name phải dài từ 2-40 ký tự, không chứa số và tuân thủ quy tắc đặt tên Zalo.",
      },
    },
    password_set: {
      type: Boolean,
      default: false,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (value) {
          // Kiểm tra mật khẩu phải bao gồm chữ cái, số và ký tự đặc biệt
          const hasLetters = /[a-zA-Z]/; // Kiểm tra chữ cái
          const hasNumbers = /\d/; // Kiểm tra số
          const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/; // Kiểm tra ký tự đặc biệt
          if (
            !hasLetters.test(value) ||
            !hasNumbers.test(value) ||
            !hasSpecialChars.test(value)
          ) {
            return false;
          }
          return true;
        },
        message:
          "Password phải chứa chữ cái, số, ký tự đặc biệt, không chứa năm sinh hoặc tên Zalo, và có độ dài từ 6 đến 32 ký tự.",
      },
    },
    profilePic: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(0[0-9]{9}|\+84[0-9]{9})$/,
        "Please enter a valid phone number",
      ],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    //isActive: là trạng thái hoạt động của người dùng (true la khi đang online, false khi offline)
    isActive: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          const ageDiff = today.getFullYear() - value.getFullYear();
          const isOldEnough =
            ageDiff > 14 ||
            (ageDiff === 14 &&
              today >=
                new Date(
                  value.getFullYear() + 14,
                  value.getMonth(),
                  value.getDate()
                ));
          return isOldEnough;
        },
        message: "Người dùng phải ít nhất 14 tuổi.",
      },
    },
    webToken: {
      type: String,
      default: null,
    },
    appToken: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: null, // Lưu thời gian hoạt động cuối để hiển thị trạng thái online
    },
  },
  { timestamps: true }
);

userSchema.post("save", async function (doc, next) {
  try {
    const exists = await Conversation.findOne({
      participants: [doc._id],
      isGroup: false,
    });

    if (!exists) {
      await Conversation.create({
        participants: [doc._id],
        isGroup: false,
        groupName: "Cloud của tôi",
        groupAvatar: "",
        unseenCount: [
          {
            user: doc._id,
            count: 0,
          },
        ],
      });
    }

    next();
  } catch (err) {
    console.error("Error creating My Cloud:", err);
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
