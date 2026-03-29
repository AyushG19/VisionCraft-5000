import { z } from "zod";

export const ClientMessage = z.object({
  name: z.string(),
  content: z.string(),
});

export type ClientMessageType = z.infer<typeof ClientMessage>;

export const ServerMessage = z.object({
  name: z.string(),
  content: z.string(),
  sender_id: z.string(),
  timeStamp_ms: z.number(),
});

export type ServerMessageType = z.infer<typeof ServerMessage>;

export const Messages = z.union([ClientMessage, ServerMessage]);

export type MessagesType = z.infer<typeof Messages>;
