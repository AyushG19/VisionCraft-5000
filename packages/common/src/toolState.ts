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
  currentColor: string;
  brushSize: number;
};
