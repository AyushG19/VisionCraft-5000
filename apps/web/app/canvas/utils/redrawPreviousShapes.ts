import { ShapeType } from "@repo/common/types";
import { drawShape } from "./drawing";

export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: ShapeType[],
  currentShape?: ShapeType,
  selectedShapeId?: string
) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawnShapes.forEach((shape) => drawShape(ctx, shape, selectedShapeId));
  if (currentShape) {
    drawShape(ctx, currentShape, selectedShapeId);
  }
}
