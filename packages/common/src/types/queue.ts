import z from "zod";
import { DrawSchema } from "./canvas";
import { EnrichedMessage } from "./message";

export const ElementUpsertPayloadSchema = z.object({
  roomId: z.string(),
  element: DrawSchema,
});

export type ElementUpsertPayloadSchemaType = z.infer<
  typeof ElementUpsertPayloadSchema
>;

export const ElementDeletePayloadSchema = z.object({
  roomId: z.string(),
  elementId: z.string(),
});

export type ElementDeletePayloadSchemaType = z.infer<
  typeof ElementDeletePayloadSchema
>;

export const ChatUpsertPayloadSchema = z.object({
  roomId: z.string(),
  Message: EnrichedMessage,
});

export type ChatUpsertPayloadSchemaType = z.infer<
  typeof ChatUpsertPayloadSchema
>;

export const RoomDeletePayloadSchema = z.object({
  roomId: z.string(),
});

export type RoomDeletePayloadSchemaType = z.infer<
  typeof RoomDeletePayloadSchema
>;
