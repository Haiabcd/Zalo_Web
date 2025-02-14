import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "file", "audio", "video", "folder"],
    required: true,
  },
  content: { type: String },
  fileInfo: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
  },
  folderInfo: {
    folderName: String,
    files: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
      },
    ],
  },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
