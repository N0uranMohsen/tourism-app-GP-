import { createClient } from "redis";

export const clientRedis = createClient({
  url: process.env.REDIS_URL, // أو أي كونفيج عندك
});

export const redisConnection = async () => {
  try {
    await clientRedis.connect();
    console.log("Redis connected sucessfully ....!");

//count number of visits
    const visits = await clientRedis.incr("visits");
    console.log(`Number of visits: ${visits}`);
  } catch (err) {
    console.error("Redis connection failed:", err.message);
  }
};

