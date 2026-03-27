import {
  DrawElement,
  MessageType,
  PointType,
  WebSocketChatType,
  WebSocketShapeType,
} from "@repo/common";
import { ChatService } from "../services/chat.service";
import { ElementService } from "../services/element.service";
import { validateSocketData } from "../util/validate";
import { WebSocket } from "ws";

/**
 * Required - To circulate in pub/sub so we can skip users if needed
 */
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
    }
  | { userId: string; type: "CURSOR"; coordinates: PointType }
  | { type: "LEAVE"; userId: string; time: number }
  | { type: "JOIN"; userId: string; time: number };

export type SendPropsType = WebSocketChatType | WebSocketShapeType;

export type AddElementPayload = Extract<
  WebSocketShapeType,
  { type: "ADD_SHAPE" }
>;
export type updateElementPayload = Extract<
  WebSocketShapeType,
  { type: "UPD_SHAPE" }
>;
export type DeleteElementPayload = Extract<
  WebSocketShapeType,
  { type: "DEL_SHAPE" }
>;

export type Services = {
  chat: ChatService;
  element: ElementService;
};
export type HandlerContext = {
  ws: WebSocket;
  roomId: string;
  userId: string;
  cleanData: ReturnType<typeof validateSocketData>;
  services: Services;
};
