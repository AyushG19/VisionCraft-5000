import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "@repo/backend-common/jwt.service";
import dotenv from "dotenv";

dotenv.config();
import { redisPub, redisSub } from "@repo/db/redis";

const wss = new WebSocketServer({ port: 3001 });
console.log("ready");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}
const users: User[] = [];

console.log(process.env.REDIS_PASS);

const parseData = (data: any) => {
  if (typeof data === "string") {
    return JSON.parse(data);
  } else {
    return JSON.parse(data.toString());
  }
};

wss.on("connection", function connection(ws, req) {
  console.log("connection requested");
  if (!req.url || !req.headers.host) {
    ws.close();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  const roomId = url.searchParams.get("roomId");
  if (!token || !url) {
    ws.close();
    return null;
  }
  console.log("1");

  const check = verifyToken(token);
  console.log(check);
  if (
    !check.valid ||
    check.decoded === undefined ||
    typeof check.decoded === "string"
  ) {
    ws.close();
    return null;
  }

  console.log("2");

  const decoded = check.decoded;

  ws.on("message", async (data) => {
    let parsedData = parseData(data);
    console.log(parsedData);

    if (parsedData.type === "join_room") {
      try {
        if (!decoded.userId) {
          ws.send(
            JSON.stringify({ status: "error", message: "User ID is missing" })
          );
          return;
        }
        const result = await redisPub.sAdd(
          `room:${roomId}:users`,
          decoded.userId
        );
        ws.send(JSON.stringify({ status: "joined", result }));
      } catch (error) {
        ws.send("connot join room");
      }
    }

    if (parsedData.type === "leave_room") {
      try {
        if (!decoded.userId) {
          ws.send(
            JSON.stringify({ status: "error", message: "User ID is missing" })
          );
          return;
        }
        const result = await redisPub.sRem(
          `room:${roomId}:users`,
          decoded.userId
        );
        ws.send(JSON.stringify({ status: "left successfully", result }));
      } catch (error) {
        ws.send("error leaving");
      }
    }

    if (parsedData.type === "subscribe") {
      try {
        const result = await redisSub.subscribe(
          `room:${roomId}:users`,
          (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.userId === decoded.userId) return;
            ws.send(parsedMessage.message);
          }
        );
        ws.send(JSON.stringify({ status: "subscribed successfully", result }));
      } catch (error) {
        console.log("error in subscribe : ", error);
      }
    }

    if (parsedData.type === "chat") {
      const messagePayload = {
        userId: decoded.userId,
        message: parsedData.message,
      };
      try {
        const result = await redisPub.publish(
          `room:${roomId}:users`,
          JSON.stringify(messagePayload)
        );
        ws.send(JSON.stringify({ status: "published", result }));
      } catch (error) {
        console.log("error in publish : ", error);
      }
    }
  });

  ws.send("something");
});
