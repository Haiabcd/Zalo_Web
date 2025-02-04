import Message from "../models/Message.js";

export const sendMessage = async (
  senderId,
  receiverId,
  messageType,
  content
) => {
  const message = new Message({ senderId, receiverId, messageType, content });
  await message.save();
  return message;
};
