export type ToolState = {
  currentTool:
    | "select"
    | "circle"
    | "square"
    | "triangle"
    | "arrow"
    | "color"
    | "pencil"
    | "undo"
    | "redo"
    | "none";
  currentColor: { l: number; c: number; h: number };
  brushSize: number;
};
