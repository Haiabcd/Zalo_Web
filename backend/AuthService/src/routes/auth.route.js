import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';  

//Tạo 1 router để xử lý các request tới /api/auth
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;