import { MessageType, ShapeType, WebSocketDataType } from "@repo/common";

export interface ChatModalProps {
  boardState: ShapeType[];
  send: (
    type: WebSocketDataType["type"],
    payload: WebSocketDataType["payload"],
  ) => void;
  messages: MessageReceivedType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageReceivedType[] | []>>;
  drawShapeFromAi: (shapes: ShapeType[]) => void;
}
export type MessageReceivedType = Extract<
  MessageType,
  { status: "TO_FRONTEND" }
>;
export type MessageToSendType = Extract<MessageType, { status: "TO_BACKEND" }>;
