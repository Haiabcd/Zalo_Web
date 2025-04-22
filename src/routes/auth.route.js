import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  validateToken,
  getUsers,
  requestOTP,
  verifyUserOTP,
  updateAvatar,
  updatePassword,
  forgotPasswordRequest,
  verifyOTPForPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { checkActiveStatus } from "../middlewares/checkActiveStatus.middleware.js";

//Tạo 1 router để xử lý các request tới /api/auth
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", protectRoute, logout);

router.put(
  "/update-avatar",
  protectRoute,
  checkActiveStatus,
  upload.single("profilePic"),
  updateAvatar
);

router.put(
  "/update-profile/:_id",
  protectRoute,
  checkActiveStatus,
  updateProfile
);

router.post("/validate-token", protectRoute, validateToken);

router.post("/get-user", protectRoute, getUsers);

router.post("/send-otp", requestOTP);
router.post("/verify-otp", verifyUserOTP);

//Kiểm tra xem user đã đăng nhập chưa (có token hay không)?
router.get("/check", protectRoute, checkAuth);

router.put("/update-password", protectRoute, updatePassword);

//Quên mật khẩu
router.post("/forgot-password/request", forgotPasswordRequest);
router.post("/forgot-password/verify-otp", verifyOTPForPasswordReset);
router.post("/forgot-password/reset", resetPassword);

export default router;
