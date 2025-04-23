import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: "" },
    groupAvatar: { type: String, default: "" },
    groupLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupDeputy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    latestActivityTime: {
      type: Date,
      default: Date.now,
    },
    unseenCount: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
