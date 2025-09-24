import { RefObject } from "react";

export interface Message {
  sender_id: string;
  name: string;
  timestamp_ms: Date;
  content: string;
}
export interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
  messages: Message[];
}
