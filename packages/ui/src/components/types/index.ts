import { ShapeType } from "@repo/common/types";
import { Dispatch, RefObject } from "react";

export interface Message {
  sender_id: string;
  name: string;
  timestamp_ms: number;
  content: string;
}
export interface ChatModalProps {
  boardState: ShapeType[];
  wsRef: RefObject<WebSocket | null>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[] | []>>;
}
