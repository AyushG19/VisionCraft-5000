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
  drawShapeFromAi: (shapes: ShapeType[]) => void;
}
export enum AuthMode {
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  icon?: React.ReactNode;
}
