import { RefObject } from "react";
import { ToolState } from "@repo/common/toolState";
import { ShapeType } from "@repo/common/types";

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

export type MoveActionPayload = {
  clickedShapeId: string;
  newStartX: number;
  newStartY: number;
};
export type Action =
  | { type: "INITIALIZE_BOARD"; payload: ShapeType[] }
  | { type: "DEL_SHAPE"; payload: ShapeType }
  | { type: "ADD_SHAPE"; payload: ShapeType }
  | { type: "UPDATE_PENCIL"; payload: currentPos }
  | { type: "UPDATE_HISTORY" }
  | { type: "FINISH_SHAPE"; payload: ShapeType }
  | { type: "REDO" }
  | { type: "UNDO" }
  | { type: "CHANGE_TOOL"; payload: ToolState["currentTool"] }
  | { type: "CHANGE_COLOR"; payload: ToolState["currentColor"] }
  | { type: "CHANGE_BRUSHSIZE"; payload: ToolState["brushSize"] }
  | { type: "MOVE"; payload: MoveActionPayload };

export interface Message {
  sender_id: string;
  name: string;
  timestamp_ms: Date;
  content: string;
}
export interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<never[]>>;
}
export type DragStateType = {
  isDragging: boolean;
  draggedShapeId: string | null;
  offsetX: number;
  offsetY: number;
};
