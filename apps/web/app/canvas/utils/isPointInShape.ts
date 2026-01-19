import { ShapeType } from "@repo/common/types";
import { recordTraceEvents } from "next/dist/trace";
import { Bounds, getHandles, HandleName } from "./getHandles";
import { setEngine } from "crypto";

export type HandlePosition =
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT";

export const isPointInHandle = (
  px: number,
  py: number,
  bounds: Bounds,
  handleSize: number = 6,
  selectedShape?: ShapeType | undefined,
): HandleName | null => {
  const handles = getHandles(bounds, handleSize);

  for (const h of handles) {
    if (px >= h.x && px <= h.x + h.size && py >= h.y && py <= h.y + h.size) {
      return h.name;
    }
  }
  if (!selectedShape) return null;
  const minX = Math.min(selectedShape.startX - 5, selectedShape.endX + 5);
  const maxX = Math.max(selectedShape.startX - 5, selectedShape.endX + 5);
  const minY = Math.min(selectedShape.startY - 5, selectedShape.endY + 5);
  const maxY = Math.max(selectedShape.startY - 5, selectedShape.endY + 5);
  const tol = selectedShape.lineWidth; // tolerance = half thickness of border
  if (Math.abs(px - minX) <= tol && py >= minY && py <= maxY) return "LEFT";
  if (Math.abs(px - maxX) <= tol && py >= minY && py <= maxY) return "RIGHT";
  if (Math.abs(py - minY) <= tol && px >= minX && px <= maxX) return "TOP";
  if (Math.abs(py - maxY) <= tol && px >= minX && px <= maxX) return "BOTTOM";

  return null;
};

// Helper function to calculate triangle area
const triangleArea = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number => {
  return Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);
};
const isPointNearLine = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tol: number,
): boolean => {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    // Points are the same, check distance to point
    const distSq = (px - ax) ** 2 + (py - ay) ** 2;
    return distSq <= tol * tol;
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;
  const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;

  return distSq <= tol * tol;
};
// Helper function to check if point is in a corner cutout (for rounded corners)
const isPointInCornerCutout = (
  px: number,
  py: number,
  topX: number,
  topY: number,
  leftX: number,
  leftY: number,
  rightX: number,
  rightY: number,
  radius: number,
): boolean => {
  // Check each corner
  const corners = [
    { x: topX, y: topY },
    { x: leftX, y: leftY },
    { x: rightX, y: rightY },
  ];

  for (const corner of corners) {
    const dist = Math.sqrt((px - corner.x) ** 2 + (py - corner.y) ** 2);
    if (dist < radius) {
      // Point is within radius of corner, need more complex check
      // This would involve checking if point is outside the rounded corner curve
      // For simplicity, we'll use a conservative approach
      return true;
    }
  }
  return false;
};
// Helper function for hit testing rounded triangle stroke
const hitTestRoundedTriangleStroke = (
  px: number,
  py: number,
  topX: number,
  topY: number,
  leftX: number,
  leftY: number,
  rightX: number,
  rightY: number,
  radius: number,
  tolerance: number,
): boolean => {
  // Calculate side lengths for radius clamping
  const sideLength1 = Math.sqrt((rightX - topX) ** 2 + (rightY - topY) ** 2);
  const sideLength2 = Math.sqrt((leftX - rightX) ** 2 + (leftY - rightY) ** 2);
  const sideLength3 = Math.sqrt((topX - leftX) ** 2 + (topY - leftY) ** 2);

  const minSide = Math.min(sideLength1, sideLength2, sideLength3);
  const maxRadius = Math.min(radius, minSide / 3);

  if (maxRadius <= 0) {
    // Fallback to sharp triangle
    return (
      isPointNearLine(px, py, topX, topY, rightX, rightY, tolerance) ||
      isPointNearLine(px, py, rightX, rightY, leftX, leftY, tolerance) ||
      isPointNearLine(px, py, leftX, leftY, topX, topY, tolerance)
    );
  }

  // Check distance to rounded edges and corners
  // This is a simplified version - for production, you'd want to check
  // the actual quadratic curves at the corners

  // Check shortened edges (accounting for rounded corners)
  const getUnitVector = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    return { x: dx / length, y: dy / length };
  };

  // Calculate shortened edge endpoints
  const topToRight = getUnitVector(topX, topY, rightX, rightY);
  const topToLeft = getUnitVector(topX, topY, leftX, leftY);
  const rightToLeft = getUnitVector(rightX, rightY, leftX, leftY);
  const rightToTop = getUnitVector(rightX, rightY, topX, topY);
  const leftToTop = getUnitVector(leftX, leftY, topX, topY);
  const leftToRight = getUnitVector(leftX, leftY, rightX, rightY);

  // Check each edge
  const edge1Start = {
    x: topX + maxRadius * topToRight.x,
    y: topY + maxRadius * topToRight.y,
  };
  const edge1End = {
    x: rightX + maxRadius * rightToTop.x,
    y: rightY + maxRadius * rightToTop.y,
  };

  const edge2Start = {
    x: rightX + maxRadius * rightToLeft.x,
    y: rightY + maxRadius * rightToLeft.y,
  };
  const edge2End = {
    x: leftX + maxRadius * leftToRight.x,
    y: leftY + maxRadius * leftToRight.y,
  };

  const edge3Start = {
    x: leftX + maxRadius * leftToTop.x,
    y: leftY + maxRadius * leftToTop.y,
  };
  const edge3End = {
    x: topX + maxRadius * topToLeft.x,
    y: topY + maxRadius * topToLeft.y,
  };

  // Check if point is near any edge or corner arc
  return (
    isPointNearLine(
      px,
      py,
      edge1Start.x,
      edge1Start.y,
      edge1End.x,
      edge1End.y,
      tolerance,
    ) ||
    isPointNearLine(
      px,
      py,
      edge2Start.x,
      edge2Start.y,
      edge2End.x,
      edge2End.y,
      tolerance,
    ) ||
    isPointNearLine(
      px,
      py,
      edge3Start.x,
      edge3Start.y,
      edge3End.x,
      edge3End.y,
      tolerance,
    ) ||
    isPointNearCornerArc(px, py, topX, topY, maxRadius, tolerance) ||
    isPointNearCornerArc(px, py, rightX, rightY, maxRadius, tolerance) ||
    isPointNearCornerArc(px, py, leftX, leftY, maxRadius, tolerance)
  );
};
const isPointNearCornerArc = (
  px: number,
  py: number,
  cornerX: number,
  cornerY: number,
  radius: number,
  tolerance: number,
): boolean => {
  const dist = Math.sqrt((px - cornerX) ** 2 + (py - cornerY) ** 2);
  return Math.abs(dist - radius) <= tolerance;
};
export default function isClickOnShape(
  points: { x: number; y: number },
  shape: ShapeType,
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
      const width = Math.abs(shape.endX - shape.startX);
      const height = Math.abs(shape.endY - shape.startY);

      if (width === 0 || height === 0) return false;

      // Normalize dimensions
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

      const radius = 7;

      // For filled shapes, check if point is inside
      if (shape.fillColor) {
        if (radius <= 0) {
          // Simple triangle area test
          const totalArea = triangleArea(
            topX,
            topY,
            leftX,
            leftY,
            rightX,
            rightY,
          );
          const area1 = triangleArea(
            points.x,
            points.y,
            leftX,
            leftY,
            rightX,
            rightY,
          );
          const area2 = triangleArea(
            topX,
            topY,
            points.x,
            points.y,
            rightX,
            rightY,
          );
          const area3 = triangleArea(
            topX,
            topY,
            leftX,
            leftY,
            points.x,
            points.y,
          );
          return Math.abs(totalArea - (area1 + area2 + area3)) < 0.01;
        } else {
          // For rounded triangle, first check if inside the main triangle
          const totalArea = triangleArea(
            topX,
            topY,
            leftX,
            leftY,
            rightX,
            rightY,
          );
          const area1 = triangleArea(
            points.x,
            points.y,
            leftX,
            leftY,
            rightX,
            rightY,
          );
          const area2 = triangleArea(
            topX,
            topY,
            points.x,
            points.y,
            rightX,
            rightY,
          );
          const area3 = triangleArea(
            topX,
            topY,
            leftX,
            leftY,
            points.x,
            points.y,
          );

          if (Math.abs(totalArea - (area1 + area2 + area3)) < 0.01) {
            // Point is inside main triangle, now check if it's not in a corner cutout
            return !isPointInCornerCutout(
              points.x,
              points.y,
              topX,
              topY,
              leftX,
              leftY,
              rightX,
              rightY,
              radius,
            );
          }
          return false;
        }
      }

      // For stroked shapes, check distance to edges
      const tolerance = shape.lineWidth;

      // Helper function to check if point is near a line segment

      if (radius <= 0) {
        // Check distance to each edge
        return (
          isPointNearLine(
            points.x,
            points.y,
            topX,
            topY,
            rightX,
            rightY,
            tolerance,
          ) ||
          isPointNearLine(
            points.x,
            points.y,
            rightX,
            rightY,
            leftX,
            leftY,
            tolerance,
          ) ||
          isPointNearLine(
            points.x,
            points.y,
            leftX,
            leftY,
            topX,
            topY,
            tolerance,
          )
        );
      } else {
        // For rounded triangle, check distance to edges with corner adjustments
        return hitTestRoundedTriangleStroke(
          points.x,
          points.y,
          topX,
          topY,
          leftX,
          leftY,
          rightX,
          rightY,
          radius,
          tolerance,
        );
      }
    }

    // Helper function to check if point is near a corner arc

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
        tol: number,
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
        shaftTolerance,
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
        cy: number,
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
      const getScreenPoint = (p: { x: number; y: number }) => {
        if (shape.isNormalized) {
          console.log("it works ig");
          return {
            x: shape.startX + p.x * (shape.endX - shape.startX),
            y: shape.startY + p.y * (shape.endY - shape.startY),
          };
        }
        return { x: p.x, y: p.y };
      };

      // check if points is near any line segment in the path
      const isNearSegment = (
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
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
        const p1 = getScreenPoint(shape.points[i]!);
        const p2 = getScreenPoint(shape.points[i + 1]!);
        if (isNearSegment(points.x, points.y, p1.x, p1.y, p2.x, p2.y))
          return true;
      }

      return false;
    }
  }
  return false;
}
export const isInsideSelectBound = (
  points: { x: number; y: number },
  bounds: Bounds,
): boolean => {
  const minX = bounds.x;
  const maxX = bounds.x + bounds.width;
  const minY = bounds.y;
  const maxY = bounds.y + bounds.height;

  return (
    points.x >= minX && points.x <= maxX && points.y >= minY && points.y <= maxY
  );
};
