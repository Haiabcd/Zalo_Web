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
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

//Tạo 1 router để xử lý các request tới /api/auth
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-avatar", protectRoute, upload.single("profilePic"), updateAvatar);

router.put("/update-profile/:_id", protectRoute, updateProfile);

router.post("/validate-token", protectRoute, validateToken);

router.post("/get-user", protectRoute, getUsers);

router.post("/send-otp", requestOTP);  
router.post("/verify-otp", verifyUserOTP); 

//Kiểm tra xem user đã đăng nhập chưa (có token hay không)?
router.get("/check", protectRoute, checkAuth);

export default router;
