import express from "express";
import { handleGetUserByPhone } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/get-by-phone/:phone", handleGetUserByPhone);

export default router;
