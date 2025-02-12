import {
  sendMessage,
  getMessagesBetweenUsers,
} from "../services/message.service.js";

export const send = async (req, res) => {
  try {
    const { senderId, receiverId, messageType, content } = req.body.params;

    // Gửi tin nhắn
    const newMessage = await sendMessage(
      senderId,
      receiverId,
      messageType,
      content
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessagesBetweenTwoUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: "Thiếu userId1 hoặc userId2" });
    }

    const messages = await getMessagesBetweenUsers(userId1, userId2);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
