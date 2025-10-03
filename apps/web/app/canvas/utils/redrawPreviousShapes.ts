import { ShapeType } from "@repo/common/types";
import { drawShape } from "./drawing";
import canvasReducer from "./canvasReducer";
import { createDotPattern } from "./createPatterns";

const patternRef: { current: CanvasPattern | null } = { current: null };
export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: ShapeType[],
  currentShape?: ShapeType,
  selectedShapeId?: string
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!patternRef.current) {
    patternRef.current = createDotPattern(ctx);
  }
  if (patternRef.current) {
    ctx.fillStyle = patternRef.current;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  for (const shape of drawnShapes) {
    if (shape.id === selectedShapeId) continue;
    drawShape(ctx, shape, selectedShapeId);
  }
  if (currentShape) {
    drawShape(ctx, currentShape, selectedShapeId);
  }
}
