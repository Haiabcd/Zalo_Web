import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked", "cancelled", "rejected"],
      default: "pending",
    },
    // Người thực hiện hành động cuối cùng
    actionUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
