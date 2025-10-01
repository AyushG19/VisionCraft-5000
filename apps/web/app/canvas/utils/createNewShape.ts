import { ShapeType } from "@repo/common/types";
import { CanvasState } from "../types";
export default function createNewShape(
  canvasState: CanvasState,
  currentPos: { x: number; y: number },
  shapeToCopy?: ShapeType,
  content?: string
): ShapeType {
  if (content) {
    return {
      id: crypto.randomUUID(),
      type: canvasState.toolState.currentTool,
      lineWidth: canvasState.toolState.brushSize,
      lineColor: canvasState.toolState.currentColor,
      content: content,
      selected: false,
      startX: canvasState.startPos.x,
      startY: canvasState.startPos.y,
      endX: canvasState.startPos.x,
      endY: canvasState.startPos.y,
    };
  }
  switch (canvasState.toolState.currentTool) {
    case "PENCIL": {
      return {
        id: crypto.randomUUID(),
        type: canvasState.toolState.currentTool,
        lineWidth: canvasState.toolState.brushSize,
        lineColor: canvasState.toolState.currentColor,
        selected: false,
        startX: canvasState.startPos.x,
        startY: canvasState.startPos.y,
        endX: canvasState.startPos.x,
        endY: canvasState.startPos.y,
        points: [canvasState.startPos],
      };
    }
    default: {
      return {
        id: crypto.randomUUID(),
        type: canvasState.toolState.currentTool,
        lineWidth: canvasState.toolState.brushSize,
        lineColor: canvasState.toolState.currentColor,
        selected: false,
        startX: canvasState.startPos.x,
        startY: canvasState.startPos.y,
        endX: currentPos.x,
        endY: currentPos.y,
      };
    }
  }
}
