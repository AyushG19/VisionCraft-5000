import { Dispatch, RefObject } from "react";

export interface Message {
  sender_id: string;
  name: string;
  timestamp_ms: number;
  content: string;
}
export interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[] | []>>;
}
