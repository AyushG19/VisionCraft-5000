import {
  DrawElement,
  MessageType,
  WebSocketChatType,
  WebSocketShapeType,
} from "@repo/common";

export type RedisData =
  | {
      userId: string;
      type: "ADD" | "DEL" | "UPD";
      element: DrawElement;
    }
  | {
      userId: string;
      type: "CHAT";
      message: Extract<MessageType, { status: "TO_FRONTEND" }>;
    };

export type SendPropsType = WebSocketChatType | WebSocketShapeType;
