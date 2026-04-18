import { z } from "zod";
import { ClientMessage, ServerMessage } from "./message";
import { DrawSchema, PointSchema } from "./canvas";

const ClientRoomSchema = z.object({
  type: z.enum(["JOIN_ROOM", "LEAVE_ROOM"]),
});

export type WebSocketRoomType = z.infer<typeof ClientRoomSchema>;

const ServerRoomSchema = z.object({
  type: z.enum(["USER_JOINED", "USER_LEFT"]),
  payload: z.object({ userId: z.string() }),
});

export type ServerRoomSchemaType = z.infer<typeof ServerRoomSchema>;

const ServerChatSchema = z.object({
  type: z.literal("CHAT"),
  payload: ServerMessage,
});

export type ServerChatSchemaType = z.infer<typeof ServerChatSchema>;

const ClientChatSchema = z.object({
  type: z.literal("CHAT"),
  payload: ClientMessage,
});

export type ClientChatSchemaType = z.infer<typeof ClientChatSchema>;

const SocketShapePayload = z.object({
  type: z.enum(["ADD_SHAPE", "DEL_SHAPE", "UPD_SHAPE"]),
  payload: DrawSchema,
});

export type WebSocketShapeType = z.infer<typeof SocketShapePayload>;

export const ServerShapeManipulationSchema = z.object({
  type: z.enum(["RESIZE", "DRAG"]),
  payload: z.object({ userId: z.string(), element: DrawSchema }),
});

export type ServerShapeManipulation = z.infer<
  typeof ServerShapeManipulationSchema
>;

export const ClientShapeManipulationSchema = z.object({
  type: z.enum(["RESIZE", "DRAG"]),
  payload: DrawSchema,
});

export type ClientShapeManipulation = z.infer<
  typeof ClientShapeManipulationSchema
>;

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

export const ServerInfoSchema = z.object({
  type: z.literal("INFO"),
  payload: z.string(),
});
export const ServerSocketData = z.discriminatedUnion("type", [
  SocketShapePayload,
  ServerChatSchema,
  ServerRoomSchema,
  ServerCursorSchema,
  ServerShapeManipulationSchema,
  ServerInfoSchema,
]);

export type ServerSocketDataType = z.infer<typeof ServerSocketData>;

export const ClientSocketData = z.discriminatedUnion("type", [
  SocketShapePayload,
  ClientChatSchema,
  ClientRoomSchema,
  ClientCursorSchema,
  ClientShapeManipulationSchema,
]);

export type ClientSocketDataType = z.infer<typeof ClientSocketData>;
