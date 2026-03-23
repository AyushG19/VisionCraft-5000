import { RefObject } from "react";
import {
  MessageType,
  ToolKitType,
  ColorType,
  AllToolTypes,
  DrawElement,
  ShapeType,
  PencilType,
  ImageType,
  LinearType,
  TextStateType,
  WebSocketChatType,
  WebSocketShapeType,
  ClientCursorSchemaType,
} from "@repo/common";
import { HandleName } from "../../lib/getHandles";

export type CanvasState = {
  drawnShapes: DrawElement[];
  history: DrawElement[][];
  historyIndex: number;
  toolState: ToolKitType;
  textState: TextStateType;
};

export type Action =
  | { type: "INITIALIZE_BOARD"; payload: DrawElement[] }
  | { type: "ADD_SHAPE"; payload: DrawElement }
  | { type: "DEL_SHAPE"; payload: DrawElement }
  | { type: "UPD_SHAPE"; payload: DrawElement }
  | { type: "FINISH_SHAPE"; payload: DrawElement }
  | { type: "REDO" }
  | { type: "UNDO" }
  | { type: "CHANGE_TOOL"; payload: AllToolTypes }
  | { type: "CHANGE_COLOR"; payload: ColorType }
  | { type: "CHANGE_BRUSHSIZE"; payload: number };

export type MessageReceivedType = Extract<
  MessageType,
  { status: "TO_FRONTEND" }
>;
export type MessageToSendType = Extract<MessageType, { status: "TO_BACKEND" }>;

export interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
  messages: MessageReceivedType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageReceivedType[]>>;
}
export type DragStateType = {
  isDragging: boolean;
  draggedShapeId: string | null;
  offsetX: number;
  offsetY: number;
};
export type ResizeStateType = {
  isResizing: boolean;
  resizeDirection: HandleName | null;
};
export type InteractionState = {
  isDrawing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  draggedShapeId: string | null;
  resizeDirection: HandleName | null;
  startPos: { x: number; y: number };
  dragOffset: { x: number; y: number };
};

export type EventType = {
  type: "ADD" | "DEL" | "UPD";
  shape: DrawElement;
};

type DrawableTool =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "line"
  | "pencil";

export const DrawableTool: DrawableTool[] = [
  "rectangle",
  "ellipse",
  "diamond",
  "arrow",
  "line",
  "pencil",
];

export type BoundedDrawElement = ShapeType | PencilType;
export type UnboundedDrawElement = ImageType | LinearType;
export type TextEditState = {
  elementId: string;
  x: number;
  y: number;
  text: string;
} | null;

//join and leaves are handled automatically
export type SendPropsType =
  | WebSocketChatType
  | WebSocketShapeType
  | ClientCursorSchemaType;
