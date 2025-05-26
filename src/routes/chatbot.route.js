import express from "express";
import geminiController from "../controllers/chatbot.controller.js";

const router = express.Router();
router.post("/generate", geminiController.generateContent);

export default router;
