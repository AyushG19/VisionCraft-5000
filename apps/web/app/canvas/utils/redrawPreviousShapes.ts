import { ShapeType } from "@repo/common/types";
import { drawShape } from "./drawing";

export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: ShapeType[],
  currentShape?: ShapeType
) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawnShapes.forEach((shape) => drawShape(ctx, shape));
  if (currentShape) {
    drawShape(ctx, currentShape);
  }
}
