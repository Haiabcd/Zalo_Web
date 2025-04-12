import amqp from "amqplib";
import redisClient from '../configs/redisClient.js'

const consumeUserUpdates = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("user_updates");

    console.log(
      "📢 Đã kết nối RabbitMQ & đang lắng nghe sự kiện user_updates..."
    );

    channel.consume("user_updates", async (msg) => {
      if (msg !== null) {
        const updatedUser = JSON.parse(msg.content.toString());
        console.log("🔄 Nhận sự kiện cập nhật user:", updatedUser);

        // 🟢 Xóa cache Redis liên quan đến bạn bè của user này
        const keys = await redisClient.keys(`friends:*`);
        for (const key of keys) {
          await redisClient.del(key);
        }

        console.log(
          `🗑 Đã xóa cache Redis liên quan đến user ${updatedUser._id}`
        );
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi kết nối RabbitMQ:", error);
  }
};

export default consumeUserUpdates;
