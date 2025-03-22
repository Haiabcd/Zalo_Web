import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379", // Redis chạy trên cổng mặc định 6379
});

redisClient.on("error", (err) => console.error("❌ Lỗi Redis:", err));

await redisClient.connect(); // Kết nối Redis

console.log("✅ Đã kết nối Redis");

export default redisClient;
