import redisClient from "../configs/redisClient.js";

const get = async (key) => {
  const data = await redisClient.get(key);
  return data ? data : null; // Trả về string thay vì Buffer
};

const set = async (key, value, ttl = 3600) => {
  await redisClient.setEx(key, ttl, value); // Lưu dưới dạng string (URL)
};

const del = async (key) => {
  await redisClient.del(key);
};

export default { get, set, del };
