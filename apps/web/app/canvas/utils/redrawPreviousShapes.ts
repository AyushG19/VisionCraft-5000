import { ShapeType } from "@repo/common/types";
import { drawShape } from "./drawing";
import canvasReducer from "./canvasReducer";

export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: ShapeType[],
  currentShape?: ShapeType,
  selectedShapeId?: string
) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const shape of drawnShapes) {
    if (shape.id === selectedShapeId) continue;
    drawShape(ctx, shape, selectedShapeId);
  }
  if (currentShape) {
    drawShape(ctx, currentShape, selectedShapeId);
  }
}
