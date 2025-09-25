export type ToolState = {
  currentTool:
    | "SELECT"
    | "CIRCLE"
    | "SQUARE"
    | "TRIANGLE"
    | "ARROW"
    | "COLOR"
    | "PENCIL"
    | "UNDO"
    | "REDO";
  currentColor: { l: number; c: number; h: number };
  brushSize: number;
};
