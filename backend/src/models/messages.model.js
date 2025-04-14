import mongoose from "mongoose";

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

const Message = mongoose.model("Message", messageSchema);
export default Message;
