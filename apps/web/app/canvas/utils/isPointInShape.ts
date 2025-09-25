import { ShapeType } from "@repo/common/types";

export default function isClickOnShape(
  points: { x: number; y: number },
  shape: ShapeType
): boolean {
  switch (shape.type) {
    case "SQUARE":
      const minX = Math.min(shape.startX, shape.endX);
      const maxX = Math.max(shape.startX, shape.endX);
      const minY = Math.min(shape.startY, shape.endY);
      const maxY = Math.max(shape.startY, shape.endY);

      if (!shape.fillColor) {
        const tol = shape.lineWidth / 2; // tolerance = thickness of border
        const onLeft =
          Math.abs(points.x - minX) <= tol &&
          points.y >= minY &&
          points.y <= maxY;
        const onRight =
          Math.abs(points.x - maxX) <= tol &&
          points.y >= minY &&
          points.y <= maxY;
        const onTop =
          Math.abs(points.y - minY) <= tol &&
          points.x >= minX &&
          points.x <= maxX;
        const onBottom =
          Math.abs(points.y - maxY) <= tol &&
          points.x >= minX &&
          points.x <= maxX;

        return onLeft || onRight || onTop || onBottom;
      }
  }
  return false;
}
