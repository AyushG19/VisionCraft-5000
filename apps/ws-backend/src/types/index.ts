import { MessageType, ShapeType } from "@repo/common";

export type RedisData = {
  userId: string;
  type: "ADD" | "DEL" | "UPD" | "CHAT";
  shape?: ShapeType;
  message?: Extract<MessageType, { status: "TO_FRONTEND" }>;
};
