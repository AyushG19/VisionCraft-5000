import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import path from "path";
import { JwtPayloadType } from "@repo/common";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { redisPub, redisSub } from "@repo/redis";
import {
  validateConnection,
  validateSocketData,
  validateToken,
} from "./util/validate";
import env from "./env";
import { convertToSocketData } from "./util/convertToSocketData";
import { RedisData } from "./types";

const wss = new WebSocketServer({ port: env.PORT });
console.log("ready");

const roomSocket: Map<string, Map<string, WebSocket>> = new Map();

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
    console.log("validation me lafda");
    res = validateToken(token);
    console.log("ignore above");
    const mainUserId = res.userId;

    ws.on("message", async (data) => {
      try {
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
                roomSocket.get(roomId)?.delete(mainUserId);
              }
              if (!roomSocket.has(roomId)) {
                roomSocket.set(roomId, new Map());
                await redisSub.subscribe(`room:${roomId}:events`, (message) => {
                  //probably add validation for mesage type ig
                  const parsedMessage: RedisData = JSON.parse(message);
                  const socketMessage = convertToSocketData(parsedMessage);
                  if (!socketMessage) return;
                  const roomUsers = roomSocket.get(roomId);
                  if (!roomUsers) {
                    console.log("returning from callback no roomUsers");
                    return;
                  }
                  for (const [userId, userSocket] of roomUsers) {
                    if (parsedMessage.userId === userId) continue;
                    userSocket.send(JSON.stringify(socketMessage));
                  }
                });
              }
              roomSocket.get(roomId)?.set(mainUserId, ws);

              ws.send(
                JSON.stringify({
                  type: "INFO",
                  message: "subscribed successfully/join room",
                }),
              );
            } catch (error) {
              console.log("error in subscribe : ", error);
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Failed to subscribe/join room",
                }),
              );
            }
            break;

          //need to write this logic
          case "LEAVE_ROOM":
            // if (!cleanData.payload || !cleanData.payload.userId) {
            //   ws.send(
            //     JSON.stringify({ type: "ERROR", message: "Malformed Payload" })
            //   );
            //   return;
            // }
            try {
              await redisPub.sRem(`room:${roomId}:users`, mainUserId);
              ws.close(1000);
            } catch (error) {
              ws.send(
                JSON.stringify({ type: "ERROR", message: "INTERNAL_ERROR" }),
              );
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
                mainUserId,
                JSON.stringify(cleanData.payload.message),
              );
              const event: RedisData = {
                type: "CHAT",
                userId: mainUserId,
                message: {
                  content: cleanData.payload.message!.content,
                  name: cleanData.payload.message!.name,
                  sender_id: mainUserId,
                  status: "TO_FRONTEND",
                  timeStamp_ms: Date.now(),
                },
              };
              await redisPub.publish(
                `room:${roomId}:events`,
                JSON.stringify(event),
              );
              ws.send(
                JSON.stringify({
                  type: "INFO",
                  message: "Succesfully published message",
                }),
              );
            } catch (error) {
              console.log("error in chat : ", error);
            }
            break;

          case "ADD_SHAPE":
            if (!cleanData.payload.shape) {
              ws.send(
                JSON.stringify({ type: "ERROR", message: "Malformed Payload" }),
              );
              return;
            }
            try {
              //shapes have a seperate data
              await redisPub.hSet(
                `room:${roomId}:shapes`,
                cleanData.payload.shape.id,
                JSON.stringify(cleanData.payload.shape),
              );
              await redisPub.rPush(
                `room:${roomId}:order`,
                cleanData.payload.shape.id,
              );
              const event: RedisData = {
                type: "ADD",
                userId: mainUserId,
                shape: cleanData.payload.shape,
              };
              await redisPub.publish(
                `room:${roomId}:events`,
                JSON.stringify(event),
              );
              ws.send(
                JSON.stringify({
                  type: "INFO",
                  message: "Succesfully published shape",
                }),
              );
            } catch (error) {
              console.log("error in adding shape : ", error);
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Failed to add shape",
                }),
              );
            }
            break;
          case "UPD_SHAPE": {
            // we are currentlty not cahnginorder on shape updates
            try {
              if (!cleanData.payload.shape) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message: "Malformed Payload",
                  }),
                );
                return;
              }
              await redisPub.hSet(
                `room:${roomId}:shapes`,
                cleanData.payload.shape.id,
                JSON.stringify(cleanData.payload.shape),
              );
              const event: RedisData = {
                type: "UPD",
                userId: mainUserId,
                shape: cleanData.payload.shape,
              };
              await redisPub.publish(
                `room:${roomId}:events`,
                JSON.stringify(event),
              );
              ws.send(
                JSON.stringify({ type: "INFO", message: "Update published" }),
              );
            } catch (error) {
              console.log("error in adding shape : ", error);
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Failed to Update shape",
                }),
              );
            }
            break;
          }
          case "DEL_SHAPE": {
            try {
              if (!cleanData.payload.shape) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    message: "Malformed Payload",
                  }),
                );
                return;
              }
              await redisPub.hDel(
                `room:${roomId}:shapes`,
                cleanData.payload.shape.id,
              );
              const event: RedisData = {
                type: "DEL",
                userId: mainUserId,
                shape: cleanData.payload.shape,
              };
              await redisPub.publish(
                `room:${roomId}:events`,
                JSON.stringify(event),
              );
              ws.send(
                JSON.stringify({ type: "INFO", message: "Delete published" }),
              );
            } catch (error) {
              console.log("error in adding shape : ", error);
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Failed to Delete shape",
                }),
              );
            }
            break;
          }
        }
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            //@ts-ignore
            message: error.message ? error.message : "Malformed Payload",
          }),
        );

        ws.close(1008, "Malformed Payload"); // 1008 = Policy Violation
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
    ws.send(
      JSON.stringify({
        type: "ERROR",
        //@ts-ignore
        message: error.message ? error.message : "Malformed Payload",
      }),
    );

    ws.close(1008, "Malformed Payload"); // 1008 = Policy Violation
  }
  ws.send(
    JSON.stringify({
      type: "INFO",
      message: "Sucessfully connected to server",
    }),
  );
});
