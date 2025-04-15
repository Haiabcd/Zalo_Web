import mongoose from "mongoose";
import Conversation from "../models/conversations.model.js";

const messageSchema = new mongoose.Schema(
  {
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
      fileType: String,
    },
    folderInfo: {
      folderName: String,
      files: [
        {
          fileName: String,
          fileUrl: String,
          fileSize: Number,
          fileType: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen", "recalled"],
      default: "sent",
    },
    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: {
          type: String,
          enum: ["heart", "like", "angry", "sad", "wow", "laugh"],
        },
      },
    ],
    deleteFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Middleware: Sau khi tin nhắn được lưu, cập nhật lastMessage luôn
messageSchema.post("save", async function (doc) {
  try {
    await Conversation.findByIdAndUpdate(
      doc.conversationId, // cái doc này là document của cái message mới tạo
      { lastMessage: doc._id }, //update cái lastMEssage ở bên Conversation
      { new: true } // này trả về document mới sau khi cập nhật nè
    );
  } catch (error) {
    console.error("Error updating last message:", error);
  }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
