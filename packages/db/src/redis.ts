import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisPub: RedisClientType = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-15513.c8.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 15513,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    keepAlive: 5000,
  },
});
export const redisSub: RedisClientType = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-15513.c8.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 15513,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    keepAlive: 5000,
  },
});

redisPub.on("error", (err) => console.log("Redis Client Error", err));
redisSub.on("error", (err) => console.log("Redis Client Error", err));

try {
  (async () => {
    await redisPub.connect();
    await redisSub.connect();
    console.log("Connected to Redis");
  })();
} catch (err) {
  console.error("Failed to connect to Redis:", err);
}
