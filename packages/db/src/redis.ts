import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisPub: RedisClientType = createClient({
  username: process.env.RS_USERNAME,
  password: process.env.RS_PASSWORD,
  socket: {
    host: process.env.RS_HOST,
    port: Number(process.env.RS_PORT),
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    keepAlive: 5000,
  },
});
export const redisSub: RedisClientType = createClient({
  username: process.env.RS_USERNAME,
  password: process.env.RS_PASSWORD,
  socket: {
    host: process.env.RS_HOST,
    port: Number(process.env.RS_PORT),
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
