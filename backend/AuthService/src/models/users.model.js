import mongoose from "mongoose";

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
            /^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơưƯăâêôơ ]+$/u;
          if (!validName.test(value)) {
            return false;
          }
          return true;
        },
        message:
          "Full name phải dài từ 2-40 ký tự, không chứa số và tuân thủ quy tắc đặt tên Zalo.",
      },
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
          return true; // Mật khẩu hợp lệ
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
      match: [/^(0[0-9]{9})$/, "Please enter a valid phone number"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
