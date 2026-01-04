import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { ShapeType, JwtPayloadType } from "@repo/common/types";
dotenv.config();
import { redisPub, redisSub } from "@repo/db/redis";
import {
  validateConnection,
  validateSocketData,
  validateToken,
} from "./util/validate";

const wss = new WebSocketServer({ port: 3001 });
console.log("ready");

type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD" | "CHAT";
  shape?: ShapeType;
  message?: string;
};
const roomSocket: Map<string, Map<string, WebSocket>> = new Map();

console.log(process.env.REDIS_PASS);

wss.on("connection", function connection(ws, req) {
  console.log("connection requested");
  if (!req.url || !req.headers.host) {
    ws.close();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  let res: JwtPayloadType, token: string, roomId: string;
  try {
    const data = validateConnection(url);
    token = data.token;
    roomId = data.roomId;
    res = validateToken(token);
    const mainUserId = res.userId;

    ws.on("message", async (data) => {
      const cleanData = validateSocketData(data);

      switch (cleanData.type) {
        case "JOIN_ROOM":
          // if (!cleanData.payload || !cleanData.payload.userId) {
          //   ws.send(
          //     JSON.stringify({ type: "ERROR", message: "MALFORMED_PAYLOAD" })
          //   );
          //   return;
          // }
          try {
            if (roomSocket.get(roomId)?.has(mainUserId)) {
              ws.send(
                JSON.stringify({
                  type: "INFO",
                  message: "Already subscribed",
                })
              );
              return;
            }
            if (!roomSocket.has(roomId)) {
              roomSocket.set(roomId, new Map());
              await redisSub.subscribe(`room:${roomId}:events`, (message) => {
                //probably add validation for mesage type ig
                const parsedMessage: EventType = JSON.parse(message);
                const roomUsers = roomSocket.get(roomId);
                if (!roomUsers) {
                  console.log("returning from callback no roomUsers");
                  return;
                }
                for (const [userId, userSocket] of roomUsers) {
                  if (parsedMessage.userId === userId) continue;
                  userSocket.send(JSON.stringify(parsedMessage));
                }
              });
            }
            roomSocket.get(roomId)?.set(mainUserId, ws);

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
          // if (!cleanData.payload || !cleanData.payload.userId) {
          //   ws.send(
          //     JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
          //   );
          //   return;
          // }
          try {
            await redisPub.sRem(
              `room:${roomId}:users`,
              cleanData.payload.userId
            );
            ws.close(1000);
          } catch (error) {
            ws.send(
              JSON.stringify({ type: "ERROR", message: "INTERNAL_ERROR" })
            );
          }
          break;

        case "SUBSCRIBE":
          try {
            const result = await redisSub.subscribe(
              `room:${roomId}:users`,
              (message) => {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.userId === mainUserId) return;
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

        case "CHAT":
          // if (!cleanData.payload || !cleanData.payload.userId) {
          //   ws.send(
          //     JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
          //   );
          //   return;
          // }
          try {
            //we use two set of data store chat and event
            await redisPub.hSet(
              `room:${roomId}:chats`,
              cleanData.payload.userId,
              JSON.stringify(cleanData.payload.message)
            );
            const event: EventType = {
              type: "CHAT",
              userId: cleanData.payload.userId,
              message: cleanData.payload.message,
            };
            await redisPub.publish(
              `room:${roomId}:events`,
              JSON.stringify(event)
            );
            ws.send(
              JSON.stringify({
                type: "INFO",
                message: "Succesfully published message",
              })
            );
          } catch (error) {
            console.log("error in chat : ", error);
          }
          break;

        case "ADD_SHAPE":
          if (!cleanData.payload.shape) {
            ws.send(
              JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
            );
            return;
          }
          try {
            //shapes have a seperate data
            await redisPub.hSet(
              `room:${roomId}:shapes`,
              cleanData.payload.shape.id,
              JSON.stringify(cleanData.payload.shape)
            );
            await redisPub.rPush(
              `room:${roomId}:order`,
              cleanData.payload.shape.id
            );
            const event: EventType = {
              type: "ADD",
              userId: cleanData.payload.userId,
              shape: cleanData.payload.shape,
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
        case "UPD_SHAPE": {
          // we are currentlty not cahnginorder on shape updates
          try {
            if (!cleanData.payload.shape) {
              ws.send(
                JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
              );
              return;
            }
            await redisPub.hSet(
              `room:${roomId}:shapes`,
              cleanData.payload.shape.id,
              JSON.stringify(cleanData.payload.shape)
            );
            const event: EventType = {
              type: "UPD",
              userId: cleanData.payload.userId,
              shape: cleanData.payload.shape,
            };
            await redisPub.publish(
              `room:${roomId}:events`,
              JSON.stringify(event)
            );
            ws.send(
              JSON.stringify({ type: "INFO", message: "Update published" })
            );
          } catch (error) {
            console.log("error in adding shape : ", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Failed to Update shape",
              })
            );
          }
          break;
        }
        case "DEL_SHAPE": {
          try {
            if (!cleanData.payload.shape) {
              ws.send(
                JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
              );
              return;
            }
            await redisPub.hDel(
              `room:${roomId}:shapes`,
              cleanData.payload.shape.id
            );
            const event: EventType = {
              type: "DEL",
              userId: cleanData.payload.userId,
              shape: cleanData.payload.shape,
            };
            await redisPub.publish(
              `room:${roomId}:events`,
              JSON.stringify(event)
            );
            ws.send(
              JSON.stringify({ type: "INFO", message: "Delete published" })
            );
          } catch (error) {
            console.log("error in adding shape : ", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Failed to Delete shape",
              })
            );
          }
          break;
        }
      }
    });
    ws.on("close", () => {
      const userSocket = roomSocket.get(roomId);
      if (!userSocket || mainUserId) return;
      userSocket.delete(mainUserId);
      if (userSocket.size === 0) {
        roomSocket.delete(roomId);
      }
    });
  } catch (error) {
    ws.send(JSON.stringify({ type: "ERROR", message: "Malformed Payload" }));

    ws.close(1008, "Malformed Payload"); // 1008 = Policy Violation
  }
  ws.send(
    JSON.stringify({ type: "INFO", message: "Sucessfully connected to server" })
  );
});
