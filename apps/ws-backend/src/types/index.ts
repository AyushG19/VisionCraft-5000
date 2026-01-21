import { MessageType, ShapeType } from "@repo/common/types";

export type RedisData = {
  userId: string;
  type: "ADD" | "DEL" | "UPD" | "CHAT";
  shape?: ShapeType;
  message?: Extract<MessageType, { status: "TO_FRONTEND" }>;
};
