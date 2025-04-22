import express from "express";
import { handleGetUserByPhone } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/get-by-phone/:phone", protectRoute , handleGetUserByPhone);

export default router;
