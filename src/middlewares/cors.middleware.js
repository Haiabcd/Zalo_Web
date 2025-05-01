import cors from "cors";

const corsOptions = {
  origin: ["http://localhost:5173", "https://zalo-web-fe-six.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
};

export default cors(corsOptions);
