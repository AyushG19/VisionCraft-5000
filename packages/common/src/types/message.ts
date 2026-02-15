import { z } from "zod";

export const IncomingMessage = z.object({
  status: z.literal("TO_BACKEND"),
  name: z.string(),
  content: z.string(),
});

export const OutgoinMessage = z.object({
  status: z.literal("TO_FRONTEND"),
  name: z.string(),
  content: z.string(),
  sender_id: z.string(),
  timeStamp_ms: z.number(),
});

export const Message = z.discriminatedUnion("status", [
  IncomingMessage,
  OutgoinMessage,
]);

export type MessageType = z.infer<typeof Message>;
