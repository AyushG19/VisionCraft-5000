import { LinearType, PointType } from "@repo/common";

export const isPointOnArrow = (
  shape: LinearType,
  currPos: PointType,
  threshold: number = 5, // Hit detection tolerance
): boolean => {
  const { startX, startY, strokeWidth } = shape;
  const endX = shape.points[2]!.x;
  const endY = shape.points[2]!.y;
  const { x, y } = currPos;

  const width = endX - startX;
  const height = endY - startY;
  const length = Math.sqrt(width * width + height * height);

  if (length < 10) return false;

  const angle = Math.atan2(height, width);
  const headLength = Math.min(20, length * 0.2);

  // Calculate arrowhead points
  const arrowX = endX;
  const arrowY = endY;
  const leftX = arrowX - headLength * Math.cos(angle - Math.PI / 8);
  const leftY = arrowY - headLength * Math.sin(angle - Math.PI / 8);
  const rightX = arrowX - headLength * Math.cos(angle + Math.PI / 8);
  const rightY = arrowY - headLength * Math.sin(angle + Math.PI / 8);

  // 1. Check if point is inside arrowhead triangle
  const isInTriangle = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ): boolean => {
    const area = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));
    return Math.abs(area - (area1 + area2 + area3)) < 1;
  };

  if (isInTriangle(x, y, arrowX, arrowY, leftX, leftY, rightX, rightY)) {
    return true;
  }

  // 2. Check if point is near the arrow shaft (line segment)
  // Calculate distance from point to line segment
  const distanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      // Start and end are the same point
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    // Calculate projection of point onto line
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t)); // Clamp to segment

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  };

  const hitRadius = Math.max(strokeWidth / 2, threshold);
  const distance = distanceToSegment(x, y, startX, startY, endX, endY);

  return distance <= hitRadius;
};
