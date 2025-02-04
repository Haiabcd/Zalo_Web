import { sendMessage } from "../services/messageService.js";

export const sendTextMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await sendMessage(senderId, receiverId, "text", content);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Gửi tin nhắn thất bại", error });
  }
};
