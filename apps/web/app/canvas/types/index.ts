import { RefObject } from "react";
import { ToolState } from "@repo/common";
import { MessageType, ShapeType } from "@repo/common";
import { HandleName } from "../utils/getHandles";

export type CanvasState = {
  startPos: { x: number; y: number };
  drawnShapes: ShapeType[];
  history: ShapeType[][];
  historyIndex: number;
  toolState: ToolState;
};
export type currentPos = {
  x: number;
  y: number;
};

export type Action =
  | { type: "INITIALIZE_BOARD"; payload: ShapeType[] }
  | { type: "ADD_SHAPE"; payload: ShapeType }
  | { type: "DEL_SHAPE"; payload: ShapeType }
  | { type: "UPDATE_PENCIL"; payload: currentPos }
  | { type: "FINISH_SHAPE"; payload: ShapeType }
  | { type: "REDO" }
  | { type: "UNDO" }
  | { type: "CHANGE_TOOL"; payload: ToolState["currentTool"] }
  | { type: "CHANGE_COLOR"; payload: ToolState["currentColor"] }
  | { type: "CHANGE_BRUSHSIZE"; payload: ToolState["brushSize"] }
  | { type: "UPD_SHAPE"; payload: ShapeType };

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
export type JoinRoomResponseType = {
  roomId: string;
  canvasState: ShapeType[];
  token: string;
};
export type EventType = {
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
