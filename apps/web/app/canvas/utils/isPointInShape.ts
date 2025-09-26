import { ShapeType } from "@repo/common/types";

export default function isClickOnShape(
  points: { x: number; y: number },
  shape: ShapeType
): boolean {
  switch (shape.type) {
    case "SQUARE": {
      const minX = Math.min(shape.startX, shape.endX);
      const maxX = Math.max(shape.startX, shape.endX);
      const minY = Math.min(shape.startY, shape.endY);
      const maxY = Math.max(shape.startY, shape.endY);

      if (!shape.fillColor) {
        const tol = shape.lineWidth / 2; // tolerance = half thickness of border
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
      return (
        points.x >= minX &&
        points.x <= maxX &&
        points.y >= minY &&
        points.y <= maxY
      );
    }
    case "CIRCLE": {
      const centerX = (shape.startX + shape.endX) / 2;
      const centerY = (shape.startY + shape.endY) / 2;

      const rx = Math.abs(shape.endX - shape.startX) / 2;
      const ry = Math.abs(shape.endY - shape.startY) / 2;

      // if you only draw perfect circles, radiusX == radiusY

      const dx = points.x - centerX;
      const dy = points.y - centerY;
      const distance = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

      if (!shape.fillColor) {
        const tolerance = 0.05;
        return distance >= 1 - tolerance && distance <= 1 + tolerance;
      }
      return distance <= 1;
    }
    case "TRIANGLE": {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;

      if (width === 0 || height === 0) break;

      // Normalize width/height and start coords
      const normalizedWidth = Math.abs(width);
      const normalizedHeight = Math.abs(height);
      const startX = width < 0 ? shape.endX : shape.startX;
      const startY = height < 0 ? shape.endY : shape.startY;

      // Compute vertices of upright triangle
      const topX = startX + normalizedWidth / 2;
      const topY = startY;
      const leftX = startX;
      const leftY = startY + normalizedHeight;
      const rightX = startX + normalizedWidth;
      const rightY = startY + normalizedHeight;

      // Area-based filled triangle hit-test
      const area = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        cx: number,
        cy: number
      ) => Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);

      const A = area(topX, topY, leftX, leftY, rightX, rightY);
      const A1 = area(points.x, points.y, leftX, leftY, rightX, rightY);
      const A2 = area(topX, topY, points.x, points.y, rightX, rightY);
      const A3 = area(topX, topY, leftX, leftY, points.x, points.y);

      if (shape.fillColor) {
        return Math.abs(A - (A1 + A2 + A3)) < 0.01;
      }

      // Border hit-test → check near edges within lineWidth tolerance
      const isPointNearLine = (
        px: number,
        py: number,
        ax: number,
        ay: number,
        bx: number,
        by: number,
        tol: number
      ) => {
        const dx = bx - ax;
        const dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = ax + t * dx;
        const closestY = ay + t * dy;
        const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;
        return distSq <= tol * tol;
      };

      const tol = shape.lineWidth / 2;
      return (
        isPointNearLine(points.x, points.y, topX, topY, leftX, leftY, tol) ||
        isPointNearLine(
          points.x,
          points.y,
          leftX,
          leftY,
          rightX,
          rightY,
          tol
        ) ||
        isPointNearLine(points.x, points.y, rightX, rightY, topX, topY, tol)
      );
    }

    case "ARROW": {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const angle = Math.atan2(height, width);

      // --- Shaft hit-test (line) ---
      const isPointNearLine = (
        px: number,
        py: number,
        ax: number,
        ay: number,
        bx: number,
        by: number,
        tol: number
      ) => {
        const A = px - ax;
        const B = py - ay;
        const C = bx - ax;
        const D = by - ay;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
          xx = ax;
          yy = ay;
        } else if (param > 1) {
          xx = bx;
          yy = by;
        } else {
          xx = ax + param * C;
          yy = ay + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return dx * dx + dy * dy <= tol * tol;
      };

      const shaftTolerance = shape.lineWidth;

      const shaftHit = isPointNearLine(
        points.x,
        points.y,
        shape.startX,
        shape.startY,
        shape.endX,
        shape.endY,
        shaftTolerance
      );

      // --- Arrowhead hit-test (triangle) ---
      const headLength = 15;
      const arrowX = shape.endX;
      const arrowY = shape.endY;

      const leftX = arrowX - headLength * Math.cos(angle - Math.PI / 7);
      const leftY = arrowY - headLength * Math.sin(angle - Math.PI / 7);

      const rightX = arrowX - headLength * Math.cos(angle + Math.PI / 7);
      const rightY = arrowY - headLength * Math.sin(angle + Math.PI / 7);

      // triangle area method
      const area = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        cx: number,
        cy: number
      ) => Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);

      const A = area(arrowX, arrowY, leftX, leftY, rightX, rightY);
      const A1 = area(points.x, points.y, leftX, leftY, rightX, rightY);
      const A2 = area(arrowX, arrowY, points.x, points.y, rightX, rightY);
      const A3 = area(arrowX, arrowY, leftX, leftY, points.x, points.y);

      const headHit = Math.abs(A - (A1 + A2 + A3)) < 0.01;

      return shaftHit || headHit;
    }
    case "PENCIL": {
      if (!shape.points || shape.points.length < 2) return false;

      const tol = shape.lineWidth;

      // check if points is near any line segment in the path
      const isNearSegment = (
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;
        return distSq <= tol * tol;
      };

      for (let i = 0; i < shape.points.length - 1; i++) {
        const p1 = shape.points[i]!;
        const p2 = shape.points[i + 1]!;
        if (isNearSegment(points.x, points.y, p1.x, p1.y, p2.x, p2.y))
          return true;
      }

      return false;
    }
  }
  return false;
}
