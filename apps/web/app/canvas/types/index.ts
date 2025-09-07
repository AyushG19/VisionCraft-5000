import { ToolState } from "@repo/common/toolState";

export interface Shape {
  type: ToolState["currentTool"];
  lineWidth: number;
  lineColor: { l: number; c: number; h: number };
  fillColor: { l: number; c: number; h: number };
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
}
export type State = {
  drawnShapes: Shape[];
  history: Shape[][];
  historyIndex: number;
};
export type currentPos = {
  x: number;
  y: number;
};
export type Action =
  | { type: "ADD_SHAPE"; payload: Shape }
  | { type: "UPDATE_PENCIL"; payload: currentPos }
  | { type: "UPDATE_HISTORY" }
  | { type: "FINISH_SHAPE"; payload: Shape }
  | { type: "REDO" }
  | { type: "UNDO" };
