import { z } from "zod";
import { Message } from "./message";
import { DrawSchema } from "./canvas";

const WebSocketRoomPayload = z.object({
  type: z.enum(["JOIN_ROOM", "LEAVE_ROOM"]),
});

export type WebSocketRoomType = z.infer<typeof WebSocketRoomPayload>;

const SokcetChatPayload = z.object({
  type: z.literal("CHAT"),
  payload: Message,
});

export type WebSocketChatType = z.infer<typeof SokcetChatPayload>;

const SocketShapePayload = z.object({
  type: z.enum(["ADD_SHAPE", "DEL_SHAPE", "UPD_SHAPE"]),
  payload: DrawSchema,
});

export type WebSocketShapeType = z.infer<typeof SocketShapePayload>;

export const WebSocketData = z.discriminatedUnion("type", [
  SocketShapePayload,
  SokcetChatPayload,
  WebSocketRoomPayload,
]);

export type WebSocketDataType = z.infer<typeof WebSocketData>;
