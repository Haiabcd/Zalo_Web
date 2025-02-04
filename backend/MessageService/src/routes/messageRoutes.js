import express from "express";
import { sendTextMessage } from "../controllers/messageController.js";
import { upload } from "../config/aws.js";

const router = express.Router();

router.post("/send-text", sendTextMessage);

router.post("/send-file", upload.single("file"), async (req, res) => {
  try {
    const { senderId, receiverId, messageType } = req.body;
    const fileUrl = req.file.location;
    const message = await sendMessage(
      senderId,
      receiverId,
      messageType,
      fileUrl
    );
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Gửi file thất bại", error });
  }
});

export default router;
