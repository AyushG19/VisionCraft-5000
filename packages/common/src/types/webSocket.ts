import { z } from "zod";
import { Message } from "./message";
import { DrawSchema, PointSchema } from "./canvas";

const WebSocketRoomPayload = z.object({
  type: z.enum(["JOIN_ROOM", "LEAVE_ROOM"]),
});

export type WebSocketRoomType = z.infer<typeof WebSocketRoomPayload>;

const ServerRoomSchema = z.object({
  type: z.enum(["USER_JOINED", "USER_LEFT"]),
  payload: z.object({ userId: z.string() }),
});

export type ServerRoomSchemaType = z.infer<typeof ServerRoomSchema>;

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

const ClientCursorSchema = z.object({
  type: z.literal("CURSOR"),
  payload: PointSchema,
});

export type ClientCursorSchemaType = z.infer<typeof ClientCursorSchema>;

const ServerCursorSchema = z.object({
  type: z.literal("CURSOR"),
  payload: z.object({ userId: z.string(), coordinates: PointSchema }),
});

export type ServerCursorSchemaType = z.infer<typeof ServerCursorSchema>;

export const ServerSocketData = z.discriminatedUnion("type", [
  SocketShapePayload,
  SokcetChatPayload,
  ServerRoomSchema,
  ServerCursorSchema,
]);

export type ServerSocketDataType = z.infer<typeof ServerSocketData>;

export const ClientSocketData = z.discriminatedUnion("type", [
  SocketShapePayload,
  SokcetChatPayload,
  WebSocketRoomPayload,
  ClientCursorSchema,
]);

export type ClientSocketDataType = z.infer<typeof ClientSocketData>;
