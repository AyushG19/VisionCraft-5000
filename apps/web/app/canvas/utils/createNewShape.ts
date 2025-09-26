import { ShapeType } from "@repo/common/types";
import { CanvasState } from "../types";
export default function createNewShape(
  canvasState: CanvasState,
  currentPos: { x: number; y: number }
): ShapeType {
  if (canvasState.toolState.currentTool === "PENCIL") {
    return {
      id: crypto.randomUUID(),
      type: canvasState.toolState.currentTool,
      lineWidth: canvasState.toolState.brushSize,
      lineColor: canvasState.toolState.currentColor,
      startX: canvasState.startPos.x,
      startY: canvasState.startPos.y,
      endX: canvasState.startPos.x,
      endY: canvasState.startPos.y,
      points: [canvasState.startPos],
    };
  }
  return {
    id: crypto.randomUUID(),
    type: canvasState.toolState.currentTool,
    lineWidth: canvasState.toolState.brushSize,
    lineColor: canvasState.toolState.currentColor,
    startX: canvasState.startPos.x,
    startY: canvasState.startPos.y,
    endX: currentPos.x,
    endY: currentPos.y,
  };
}
