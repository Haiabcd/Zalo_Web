import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    actionUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked", "cancelled", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
