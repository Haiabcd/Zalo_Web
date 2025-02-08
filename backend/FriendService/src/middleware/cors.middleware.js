import cors from "cors";

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // credentials: true allows the frontend to send cookies
  optionsSuccessStatus: 200, // tránh lỗi trình duyệt cũ
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
