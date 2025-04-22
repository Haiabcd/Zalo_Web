import cors from "cors";

const corsOptions = {
  origin: "https://zalo-web-fe.vercel.app",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
};

export default cors(corsOptions);
