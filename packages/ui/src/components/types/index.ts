import {
  DrawElement,
  MessageType,
  WebSocketChatType,
  WebSocketShapeType,
} from "@repo/common";

export type MessageReceivedType = Extract<
  MessageType,
  { status: "TO_FRONTEND" }
>;
export type MessageToSendType = Extract<MessageType, { status: "TO_BACKEND" }>;

export type SideChatPropsType = {
  send: (
    type: WebSocketChatType["type"] | WebSocketShapeType["type"],
    payload: WebSocketChatType["payload"] | WebSocketShapeType["payload"],
  ) => void;
  messages: MessageReceivedType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageReceivedType[] | []>>;
  fetchChartFromAi: (userCommand: string) => void;
  isOpen: boolean;
};

// Minimal generic skeleton to get autocomplete. Replace fields with concrete ones after inspecting runtime output.
export type ExcalidrawElementSkeleton = {
  id?: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  // add more properties you observe in the output...
  [key: string]: any;
};
