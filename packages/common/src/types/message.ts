import { z } from "zod";

export const IncomingMessage = z.object({
  status: z.literal("TO_BACKEND"),
  name: z.string(),
  content: z.string(),
});

export const EnrichedMessage = z.object({
  status: z.literal("TO_FRONTEND"),
  name: z.string(),
  content: z.string(),
  sender_id: z.string(),
  timeStamp_ms: z.number(),
});

export type EnrichedMessageType = z.infer<typeof EnrichedMessage>;

export const Message = z.discriminatedUnion("status", [
  IncomingMessage,
  EnrichedMessage,
]);

export type MessageType = z.infer<typeof Message>;
