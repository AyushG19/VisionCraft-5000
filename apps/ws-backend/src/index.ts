import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "@repo/backend-common/jwt.service";
import dotenv from "dotenv";
import {
  WebSocketDataType,
  WebSocketData,
  ShapeType,
} from "@repo/common/types";
dotenv.config();
import { redisPub, redisSub } from "@repo/db/redis";

const wss = new WebSocketServer({ port: 3001 });
console.log("ready");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
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
  if (!token || !url || !roomId) {
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
    let validatedData = WebSocketData.safeParse(parseData(data));
    if (!validatedData.success || !validatedData.data.type) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Invalid data" }));
      return;
    }
    console.log(validatedData);
    const payload = validatedData.data.payload;
    if (!payload || !payload.shape || !payload.userId) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Malformed Payload" }));
      return;
    }
    switch (validatedData.data.type) {
      case "JOIN_ROOM":
        try {
          const exists = await redisPub.sIsMember(
            `room:${roomId}:users`,
            payload.userId
          );
          if (exists) {
            ws.send(
              JSON.stringify({
                type: "INFO",
                message: "Already subscribed",
              })
            );
            return;
          }
          await redisPub.sAdd(`room:${roomId}:users`, payload.userId);
          await redisSub.subscribe(`room:${roomId}:events`, (message) => {
            const parsedMessage: EventType = JSON.parse(message);
            if (parsedMessage.userId === decoded.userId) return;
            ws.send(JSON.stringify(parsedMessage));
          });
          ws.send(
            JSON.stringify({
              type: "INFO",
              message: "subscribed successfully/join room",
            })
          );
        } catch (error) {
          console.log("error in subscribe : ", error);
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Failed to subscribe/join room",
            })
          );
        }
        break;

      case "LEAVE_ROOM":
        try {
          await redisPub.sRem(`room:${roomId}:users`, payload.userId);
          ws.close(1000);
        } catch (error) {
          ws.send(
            JSON.stringify({ type: "ERROR", message: "Failed to Leave Room" })
          );
        }
        break;

      case "SUBSCRIBE":
        try {
          const result = await redisSub.subscribe(
            `room:${roomId}:users`,
            (message) => {
              const parsedMessage = JSON.parse(message);
              if (parsedMessage.userId === decoded.userId) return;
              ws.send(parsedMessage.message);
            }
          );
          ws.send(
            JSON.stringify({ status: "subscribed successfully", result })
          );
        } catch (error) {
          console.log("error in subscribe : ", error);
        }
        break;

      // case "CHAT":
      //   const messagePayload = {
      //     userId: decoded.userId,
      //     message: validatedData.data.message,
      //   };
      //   try {
      //     const result = await redisPub.publish(
      //       `room:${roomId}:users`,
      //       JSON.stringify(messagePayload)
      //     );
      //     ws.send(JSON.stringify({ status: "published", result }));
      //   } catch (error) {
      //     console.log("error in publish : ", error);
      //   } finally {
      //     return;
      //   }

      case "ADD_SHAPE":
        try {
          await redisPub.hSet(
            `room:${roomId}:shapes`,
            payload.shape.id,
            JSON.stringify(payload.shape)
          );
          await redisPub.rPush(`room:${roomId}:order`, payload.shape.id);
          const event: EventType = {
            type: "ADD",
            userId: payload.userId,
            shape: payload.shape,
          };
          await redisPub.publish(
            `room:${roomId}:events`,
            JSON.stringify(event)
          );
          ws.send(
            JSON.stringify({
              type: "INFO",
              message: "Succesfully published shape",
            })
          );
        } catch (error) {
          console.log("error in adding shape : ", error);
          ws.send(
            JSON.stringify({ type: "ERROR", message: "Failed to add shape" })
          );
        }
        break;
    }
  });

  ws.send(
    JSON.stringify({ type: "INFO", message: "Sucessfully connected to server" })
  );
});
