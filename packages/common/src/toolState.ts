export type ToolState = {
  currentTool:
    | "SELECT"
    | "CIRCLE"
    | "SQUARE"
    | "TRIANGLE"
    | "TEXT"
    | "ARROW"
    | "COLOR"
    | "PENCIL"
    | "UNDO"
    | "REDO";
  currentColor: { l: number; c: number; h: number };
  brushSize: number;
};
