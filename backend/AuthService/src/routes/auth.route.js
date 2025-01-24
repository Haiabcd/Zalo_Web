import express from 'express';
import { signup, login, logout, updateProfile, checkAuth} from '../controllers/auth.controller.js';  
import { protectRoute } from '../middleware/auth.middleware.js';

//Tạo 1 router để xử lý các request tới /api/auth
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

//Kiểm tra xem user đã đăng nhập chưa (có token hay không)?
router.get("/check", protectRoute, checkAuth);

export default router;