import { createContext } from "vm";
import oklchToCSS from "./oklchToCss";
import { ShapeSchema, type ShapeType } from "@repo/common/types";
import { Bounds, getHandles, Handle } from "./getHandles";

// Type definitions for better type safety
interface Point {
  x: number;
  y: number;
}

interface ColorType {
  // Define the structure of your color type based on your actual implementation
  l: number;
  c: number;
  h: number;
  a?: number;
}

// Type guard to check if shape has points
const hasPoints = (
  shape: ShapeType
): shape is ShapeType & { points: Point[] } => {
  return (
    "points" in shape && Array.isArray(shape.points) && shape.points.length > 0
  );
};

// Type guard to check if shape has fill color
const hasFillColor = (
  shape: ShapeType
): shape is ShapeType & { fillColor: ColorType } => {
  return "fillColor" in shape && shape.fillColor != null;
};

// Type guard to check if shape has line width
const hasLineWidth = (
  shape: ShapeType
): shape is ShapeType & { lineWidth: number } => {
  return "lineWidth" in shape && typeof shape.lineWidth === "number";
};

const hasContent = (
  shape: ShapeType
): shape is ShapeType & { content: string } => {
  return "content" in shape && typeof shape.content === "string";
};

// Draw all handles
export const drawHandles = (
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  handleSize: number = 6
): Handle[] => {
  const handles = getHandles(bounds, handleSize);

  ctx.strokeStyle = "lch(65% 50 250)";
  ctx.lineWidth = 1;
  handles.forEach(({ x, y, size }) => {
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
  });

  return handles;
};

// Highlight selected shape (outline + handles)
const highlightShape = (
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  bounds: { x: number; y: number; width: number; height: number }
) => {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([4, 2]); // dashed outline looks lighter
  ctx.strokeStyle = "lch(65% 100 250)";
  ctx.lineWidth = 1;

  // Use bounds rectangle instead of redrawing shape path
  ctx.strokeRect(
    bounds.x - 5,
    bounds.y - 5,
    bounds.width + 10,
    bounds.height + 10
  );

  ctx.restore();

  // Draw resize handles
  drawHandles(ctx, {
    x: bounds.x - 5,
    y: bounds.y - 5,
    width: bounds.width + 10,
    height: bounds.height + 10,
  });
};
// Helper function to create rounded rectangle path
const createRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 8
): void => {
  // Normalize coordinates to handle drawing in any direction
  const left = Math.abs(Math.min(x, x + width));
  const right = Math.abs(Math.max(x, x + width));
  const top = Math.abs(Math.min(y, y + height));
  const bottom = Math.abs(Math.max(y, y + height));

  const actualWidth = right - left;
  const actualHeight = bottom - top;

  const r = Math.min(radius, actualWidth / 2, actualHeight / 2);

  ctx.beginPath();
  ctx.moveTo(left + r, top);
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(left + r, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - r);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();
};

// Helper function for smooth pencil drawing using quadratic curves
const drawSmoothPencilPath = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[]
): void => {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);

  if (points.length === 2) {
    ctx.lineTo(points[1]!.x, points[1]!.y);
  } else {
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const currentPoint = points[i]!;
      const nextPoint = points[i + 1]!;
      const controlX = currentPoint.x;
      const controlY = currentPoint.y;
      const endX = (currentPoint.x + nextPoint.x) / 2;
      const endY = (currentPoint.y + nextPoint.y) / 2;

      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    }

    // Connect to the last point
    const lastPoint = points[points.length - 1]!;
    ctx.lineTo(lastPoint.x, lastPoint.y);
  }
};

// Helper function for enhanced arrow with rounded arrowhead
const drawEnhancedArrow = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  fillColor?: ColorType | null
): void => {
  const width = endX - startX;
  const height = endY - startY;
  const angle = Math.atan2(height, width);
  const length = Math.sqrt(width * width + height * height);

  // Don't draw if too short
  if (length < 10) return;

  // Enhanced arrow shaft with rounded ends
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Dynamic arrowhead size based on arrow length
  const headLength = Math.min(20, length * 0.2);
  const headWidth = headLength * 0.6;

  // Calculate arrowhead points with better proportions
  const arrowX = endX;
  const arrowY = endY;
  const leftX = arrowX - headLength * Math.cos(angle - Math.PI / 8);
  const leftY = arrowY - headLength * Math.sin(angle - Math.PI / 8);
  const rightX = arrowX - headLength * Math.cos(angle + Math.PI / 8);
  const rightY = arrowY - headLength * Math.sin(angle + Math.PI / 8);

  // Draw filled arrowhead with rounded joins
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(leftX, leftY);
  ctx.moveTo(rightX, rightY);
  ctx.lineTo(arrowX, arrowY);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = oklchToCSS(fillColor);
    ctx.fill();
  }
  ctx.stroke();
};

// Improved rounded triangle drawing with consistent gap application
const drawRoundedTriangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 6,
  gap: number = 0 // gap for outline spacing
): void => {
  // Normalize dimensions to handle negative width/height
  const normalizedWidth = Math.abs(width);
  const normalizedHeight = Math.abs(height);
  const startX = width < 0 ? x + width : x;
  const startY = height < 0 ? y + height : y;

  // Calculate vertices for upright triangle
  const topX = startX + normalizedWidth / 2;
  const topY = startY;
  const leftX = startX;
  const leftY = startY + normalizedHeight;
  const rightX = startX + normalizedWidth;
  const rightY = startY + normalizedHeight;

  // Calculate centroid
  const centerX = (topX + leftX + rightX) / 3;
  const centerY = (topY + leftY + rightY) / 3;

  // Apply gap offset by moving vertices away from centroid
  let scaledTopX = topX;
  let scaledTopY = topY;
  let scaledLeftX = leftX;
  let scaledLeftY = leftY;
  let scaledRightX = rightX;
  let scaledRightY = rightY;

  if (gap !== 0) {
    // Calculate offset for each vertex
    const offsetVertex = (vx: number, vy: number) => {
      const dx = vx - centerX;
      const dy = vy - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return { x: vx, y: vy };

      // Normalize and apply gap
      const offsetX = (dx / dist) * gap;
      const offsetY = (dy / dist) * gap;
      return { x: vx + offsetX, y: vy + offsetY };
    };

    const topOffset = offsetVertex(topX, topY);
    scaledTopX = topOffset.x;
    scaledTopY = topOffset.y;

    const leftOffset = offsetVertex(leftX, leftY);
    scaledLeftX = leftOffset.x;
    scaledLeftY = leftOffset.y;

    const rightOffset = offsetVertex(rightX, rightY);
    scaledRightX = rightOffset.x;
    scaledRightY = rightOffset.y;
  }

  // Calculate side lengths for radius clamping
  const sideLength1 = Math.sqrt(
    (scaledRightX - scaledTopX) ** 2 + (scaledRightY - scaledTopY) ** 2
  );
  const sideLength2 = Math.sqrt(
    (scaledLeftX - scaledRightX) ** 2 + (scaledLeftY - scaledRightY) ** 2
  );
  const sideLength3 = Math.sqrt(
    (scaledTopX - scaledLeftX) ** 2 + (scaledTopY - scaledLeftY) ** 2
  );

  const minSide = Math.min(sideLength1, sideLength2, sideLength3);
  const maxRadius = Math.min(radius, minSide / 3);

  ctx.beginPath();

  if (maxRadius <= 0) {
    // Fallback to sharp triangle
    ctx.moveTo(scaledTopX, scaledTopY);
    ctx.lineTo(scaledRightX, scaledRightY);
    ctx.lineTo(scaledLeftX, scaledLeftY);
    ctx.closePath();
    return;
  }

  // Calculate unit vectors for each edge direction
  const getUnitVector = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    return { x: dx / length, y: dy / length };
  };

  // Get unit vectors for each direction
  const topToRight = getUnitVector(
    scaledTopX,
    scaledTopY,
    scaledRightX,
    scaledRightY
  );
  const topToLeft = getUnitVector(
    scaledTopX,
    scaledTopY,
    scaledLeftX,
    scaledLeftY
  );
  const rightToLeft = getUnitVector(
    scaledRightX,
    scaledRightY,
    scaledLeftX,
    scaledLeftY
  );
  const rightToTop = getUnitVector(
    scaledRightX,
    scaledRightY,
    scaledTopX,
    scaledTopY
  );
  const leftToTop = getUnitVector(
    scaledLeftX,
    scaledLeftY,
    scaledTopX,
    scaledTopY
  );
  const leftToRight = getUnitVector(
    scaledLeftX,
    scaledLeftY,
    scaledRightX,
    scaledRightY
  );

  // Calculate offset points for rounded corners
  const topRightOffsetX = scaledTopX + maxRadius * topToRight.x;
  const topRightOffsetY = scaledTopY + maxRadius * topToRight.y;
  const topLeftOffsetX = scaledTopX + maxRadius * topToLeft.x;
  const topLeftOffsetY = scaledTopY + maxRadius * topToLeft.y;

  const rightTopOffsetX = scaledRightX + maxRadius * rightToTop.x;
  const rightTopOffsetY = scaledRightY + maxRadius * rightToTop.y;
  const rightLeftOffsetX = scaledRightX + maxRadius * rightToLeft.x;
  const rightLeftOffsetY = scaledRightY + maxRadius * rightToLeft.y;

  const leftRightOffsetX = scaledLeftX + maxRadius * leftToRight.x;
  const leftRightOffsetY = scaledLeftY + maxRadius * leftToRight.y;
  const leftTopOffsetX = scaledLeftX + maxRadius * leftToTop.x;
  const leftTopOffsetY = scaledLeftY + maxRadius * leftToTop.y;

  // Draw the path with rounded corners
  ctx.moveTo(topRightOffsetX, topRightOffsetY);
  ctx.lineTo(rightTopOffsetX, rightTopOffsetY);
  ctx.quadraticCurveTo(
    scaledRightX,
    scaledRightY,
    rightLeftOffsetX,
    rightLeftOffsetY
  );
  ctx.lineTo(leftRightOffsetX, leftRightOffsetY);
  ctx.quadraticCurveTo(
    scaledLeftX,
    scaledLeftY,
    leftTopOffsetX,
    leftTopOffsetY
  );
  ctx.lineTo(topLeftOffsetX, topLeftOffsetY);
  ctx.quadraticCurveTo(
    scaledTopX,
    scaledTopY,
    topRightOffsetX,
    topRightOffsetY
  );
  ctx.closePath();
};

// Main draw function
export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  selectedShapeId?: string
): void => {
  if (!ctx || !shape) return;
  const width = shape.endX - shape.startX;
  const height = shape.endY - shape.startY;

  // convert color safely
  let strokeColor = "black";
  try {
    if (shape.lineColor) strokeColor = oklchToCSS(shape.lineColor);
  } catch (e) {
    console.warn("Invalid lineColor", e);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = hasLineWidth(shape) ? shape.lineWidth : 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // bounding box (for highlight & handles)
  const bounds = { x: shape.startX, y: shape.startY, width, height };

  ctx.save();
  try {
    switch (shape.type) {
      case "PENCIL":
        if (hasPoints(shape)) {
          ctx.beginPath();
          drawSmoothPencilPath(ctx, shape.points);
          ctx.stroke();
        }
        break;

      case "ARROW":
        drawEnhancedArrow(
          ctx,
          shape.startX,
          shape.startY,
          shape.endX,
          shape.endY,
          shape.lineColor
        );
        break;

      case "CIRCLE": {
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        const rx = Math.abs(width / 2);
        const ry = Math.abs(height / 2);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
        if (hasFillColor(shape))
          (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
        ctx.stroke();
        break;
      }

      case "SQUARE": {
        const radius = Math.min(8, Math.abs(width) / 8, Math.abs(height) / 8);
        createRoundedRectPath(
          ctx,
          shape.startX,
          shape.startY,
          width,
          height,
          radius
        );
        if (hasFillColor(shape))
          (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
        ctx.stroke();
        break;
      }

      case "TRIANGLE": {
        const radius = Math.min(6, Math.abs(width) / 10, Math.abs(height) / 10);
        drawRoundedTriangle(
          ctx,
          shape.startX,
          shape.startY,
          width,
          height,
          radius
        );
        if (hasFillColor(shape))
          (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
        ctx.stroke();
        break;
      }

      case "TEXT":
        if (hasContent(shape)) {
          ctx.textAlign = "center";
          ctx.fillText(shape.content, shape.startX, shape.startY);
        }
        break;
    }
  } finally {
    ctx.restore();
  }

  // Selected → draw highlight (outline + resize handles)
  if (
    (shape.id === selectedShapeId && shape.type === "CIRCLE") ||
    (shape.id === selectedShapeId && shape.type === "SQUARE") ||
    (shape.id === selectedShapeId && shape.type === "TRIANGLE")
  ) {
    highlightShape(ctx, shape, bounds);
  }
};
