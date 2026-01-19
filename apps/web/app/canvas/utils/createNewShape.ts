import { ShapeType } from "@repo/common/types";
import {} from "../types";
import { ToolState } from "@repo/common/toolState";
export default function createNewShape(
  toolState: ToolState,
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number },
  shapeToCopy?: ShapeType,
  content?: string,
): ShapeType {
  if (content) {
    return {
      id: crypto.randomUUID(),
      type: toolState.currentTool,
      lineWidth: toolState.brushSize,
      lineColor: toolState.currentColor,
      content: content,
      isNormalized: false,
      selected: false,
      startX: startPos.x,
      startY: startPos.y,
      endX: startPos.x,
      endY: startPos.y,
    };
  }
  switch (toolState.currentTool) {
    case "PENCIL": {
      return {
        id: crypto.randomUUID(),
        type: toolState.currentTool,
        lineWidth: toolState.brushSize,
        lineColor: toolState.currentColor,
        selected: false,
        isNormalized: false,
        startX: startPos.x,
        startY: startPos.y,
        endX: currentPos.x,
        endY: currentPos.y,
        points: [startPos],
      };
    }
    default: {
      return {
        id: crypto.randomUUID(),
        type: toolState.currentTool,
        lineWidth: toolState.brushSize,
        lineColor: toolState.currentColor,
        selected: false,
        isNormalized: false,
        startX: Math.min(startPos.x, currentPos.x),
        startY: Math.min(startPos.y, currentPos.y),
        endX: Math.max(startPos.x, currentPos.x),
        endY: Math.max(startPos.y, currentPos.y),
      };
    }
  }
}
