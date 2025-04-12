import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379',  // Địa chỉ Redis
});

redisClient.on('error', (err) => console.error('❌ Lỗi Redis:', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Đã kết nối Redis');
  } catch (error) {
    console.error('❌ Lỗi khi kết nối Redis:', error);
  }
};

connectRedis(); 

export default redisClient;
