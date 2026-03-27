import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import path from "path";
import type { JwtPayloadType } from "@repo/common";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { redisPub } from "@repo/redis/dist";
import {
  validateConnection,
  validateSocketData,
  validateToken,
} from "./util/validate";
import env from "./env";
import { ChatService } from "./services/chat.service";
import { appQueue, initQueue } from "@repo/queue";
import { ElementService } from "./services/element.service";
import { removeUserFromRoom } from "./room/room.lifecycle";
import { startIdleSweeper } from "./room/room.sweeper";
import { sendError, sendInfo } from "./helpers/ws.helper";
import { handlers } from "./handlers";

const wss = new WebSocketServer({ port: env.PORT });
console.log(`[WS] Server listening on port ${env.PORT}`);

initQueue(
  `redis://${env.RS_USERNAME}:${env.RS_PASSWORD}@${env.RS_HOST}:${env.RS_PORT}`,
);

startIdleSweeper();

const chatService = new ChatService(redisPub, appQueue);
const elementService = new ElementService(redisPub, appQueue);

wss.on("connection", (ws, req) => {
  if (!req.url || !req.headers.host) {
    ws.close(1008, "Missing URL or host header");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  let jwtPayload: JwtPayloadType;
  let roomId: string;
  let userId: string;

  try {
    const { token, roomId: rid } = validateConnection(url);
    roomId = rid;
    jwtPayload = validateToken(token);
    userId = jwtPayload.userId;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    sendError(ws, message);
    ws.close(1008, message);
    return;
  }

  sendInfo(ws, "Connected to server");
  console.log(`[WS] User ${userId} connected (room: ${roomId})`);

  ws.on("message", async (raw) => {
    try {
      const cleanData = validateSocketData(raw);
      const handler = handlers[cleanData.type];

      if (!handler) {
        sendError(ws, `Unknown message type: ${cleanData.type}`);
        return;
      }
      const services = { chat: chatService, element: elementService };
      await handler({ ws, roomId, userId, cleanData, services });
    } catch (err) {
      const message = err instanceof Error ? err.message : "INTERNAL_ERROR";
      console.error(`[WS] Handler error (user: ${userId}):`, err);
      sendError(ws, message);
    }
  });

  ws.on("close", async (code) => {
    console.log(
      `[WS] User ${userId} disconnected (room: ${roomId}) — code: ${code}`,
    );
    await removeUserFromRoom(roomId, userId);
  });

  ws.on("error", (err) => {
    console.error(`[WS] Socket error (user: ${userId}):`, err);
  });
});
