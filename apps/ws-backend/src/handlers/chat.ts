import { sendError } from "../helpers/ws.helper";
import { touchRoom } from "../room/room.lifecycle";
import { ChatRedisData } from "../services/chat.service";
import { HandlerContext } from "../types";

export async function CHAT({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "CHAT") return;
  const { payload } = cleanData;
  const { chat } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ChatRedisData = {
    type: "CHAT",
    userId,
    message: {
      content: payload.content,
      name: payload.name,
      sender_id: userId,
      status: "TO_FRONTEND",
      timeStamp_ms: Date.now(),
    },
  };

  chat.add(roomId, event);
}
