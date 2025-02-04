import mongoose from "mongoose";

export const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI);
};
