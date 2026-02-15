import oklchToCSS from "./oklchToCss";
import {
  ActionTool,
  PointType,
  TextType,
  type DrawElement,
} from "@repo/common";
import { Bounds, getHandles, Handle } from "../../lib/getHandles";
import { start } from "repl";
import {
  createRoundedRectPath,
  drawHandles,
  drawLabel,
} from "app/lib/drawingHelpers";

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
  shape: DrawElement,
): shape is DrawElement & { points: Point[] } => {
  return (
    "points" in shape && Array.isArray(shape.points) && shape.points.length > 0
  );
};

// Type guard to check if shape has fill color
const hasFillColor = (
  shape: DrawElement,
): shape is DrawElement & { fillColor: ColorType } => {
  return "fillColor" in shape && shape.fillColor != null;
};

// Type guard to check if shape has line width
const hasLineWidth = (
  shape: DrawElement,
): shape is DrawElement & { lineWidth: number } => {
  return "lineWidth" in shape && typeof shape.lineWidth === "number";
};

const hasContent = (
  shape: DrawElement,
): shape is DrawElement & { content: string } => {
  return "content" in shape && typeof shape.content === "string";
};

// Highlight selected shape (outline + handles)
const highlightShape = (
  ctx: CanvasRenderingContext2D,
  shape: DrawElement,
  bounds: { x: number; y: number; width: number; height: number },
) => {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([4, 2]); // dashed outline looks lighter
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 1;

  // Use bounds rectangle instead of redrawing shape path
  ctx.strokeRect(
    bounds.x - 5,
    bounds.y - 5,
    bounds.width + 10,
    bounds.height + 10,
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

// Helper function for smooth pencil drawing using quadratic curves
const drawSmoothPencilPath = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  startPos: PointType,
  width: number,
  height: number,
  isNormalized: boolean,
): void => {
  if (points.length < 2) return;

  // 1. Helper to get screen coordinates regardless of mode
  const getScreenPoint = (p: Point) => {
    if (isNormalized) {
      // console.log("it works ig");
      return {
        x: startPos.x + p.x * width,
        y: startPos.y + p.y * height,
      };
    }
    return { x: p.x, y: p.y };
  };

  const p0 = getScreenPoint(points[0]!);
  const p1 = getScreenPoint(points[1]!);

  ctx.moveTo(p0.x, p0.y);

  // 2. Handle Simple Line (2 points)
  if (points.length === 2) {
    ctx.lineTo(p1.x, p1.y);
    return; // Don't forget to stroke in the parent function!
  }

  // 3. Smooth Curve Loop
  // We loop from index 1 to length - 2
  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = getScreenPoint(points[i]!);
    const nextPoint = getScreenPoint(points[i + 1]!);

    // The Control Point is the current point (pulls the curve)
    const controlX = currentPoint.x;
    const controlY = currentPoint.y;

    // The End Point is the midpoint between current and next
    const endX = (currentPoint.x + nextPoint.x) / 2;
    const endY = (currentPoint.y + nextPoint.y) / 2;

    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  }

  // 4. Connect to the very last point explicitly
  const lastPoint = getScreenPoint(points[points.length - 1]!);
  ctx.lineTo(lastPoint.x, lastPoint.y);
};

// Helper function for enhanced arrow with rounded arrowhead
const drawEnhancedArrow = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  fillColor?: ColorType | null,
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
    // ctx.fillStyle = oklchToCSS(fillColor);
    // ctx.fill();
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
  gap: number = 0, // gap for outline spacing
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
    (scaledRightX - scaledTopX) ** 2 + (scaledRightY - scaledTopY) ** 2,
  );
  const sideLength2 = Math.sqrt(
    (scaledLeftX - scaledRightX) ** 2 + (scaledLeftY - scaledRightY) ** 2,
  );
  const sideLength3 = Math.sqrt(
    (scaledTopX - scaledLeftX) ** 2 + (scaledTopY - scaledLeftY) ** 2,
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
    toY: number,
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
    scaledRightY,
  );
  const topToLeft = getUnitVector(
    scaledTopX,
    scaledTopY,
    scaledLeftX,
    scaledLeftY,
  );
  const rightToLeft = getUnitVector(
    scaledRightX,
    scaledRightY,
    scaledLeftX,
    scaledLeftY,
  );
  const rightToTop = getUnitVector(
    scaledRightX,
    scaledRightY,
    scaledTopX,
    scaledTopY,
  );
  const leftToTop = getUnitVector(
    scaledLeftX,
    scaledLeftY,
    scaledTopX,
    scaledTopY,
  );
  const leftToRight = getUnitVector(
    scaledLeftX,
    scaledLeftY,
    scaledRightX,
    scaledRightY,
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
    rightLeftOffsetY,
  );
  ctx.lineTo(leftRightOffsetX, leftRightOffsetY);
  ctx.quadraticCurveTo(
    scaledLeftX,
    scaledLeftY,
    leftTopOffsetX,
    leftTopOffsetY,
  );
  ctx.lineTo(topLeftOffsetX, topLeftOffsetY);
  ctx.quadraticCurveTo(
    scaledTopX,
    scaledTopY,
    topRightOffsetX,
    topRightOffsetY,
  );
  ctx.closePath();
};

function drawText(ctx: CanvasRenderingContext2D, el: TextType) {
  ctx.save();

  ctx.font = `${el.fontSize}px ${el.fontFamily}`;
  ctx.fillStyle = oklchToCSS(el.strokeColor);
  ctx.textAlign = el.textAlign;
  ctx.textBaseline = "top";

  ctx.fillText(el.text, el.startX, el.startY);
}

//Draw line function
function drawLine(ctx: CanvasRenderingContext2D, points: readonly PointType[]) {
  const startPos = points[0]!;
  const endPos = points[2]!;

  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
  return;
}
// Main draw function
export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: DrawElement,
  selectedShapeId?: string,
): void => {
  if (!ctx || !shape) return;

  const type = shape.type;

  // convert color safely
  let strokeColor = "white";
  try {
    if (shape.strokeColor) strokeColor = oklchToCSS(shape.strokeColor);
  } catch (e) {
    console.warn("Invalid lineColor", e);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = hasLineWidth(shape) ? shape.lineWidth : 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // bounding box (for highlight & handles)

  ctx.save();
  try {
    if (shape.type === "pencil") {
      ctx.beginPath();
      drawSmoothPencilPath(
        ctx,
        shape.points,
        {
          x: shape.startX,
          y: shape.startY,
        },
        shape.endX - shape.startX,
        shape.endY - shape.startY,
        shape.isNormalized,
      );
      ctx.stroke();
    }
    if (shape.type === "arrow") {
      const endX = shape.startX + shape.points[2]!.x;
      const endY = shape.startY + shape.points[2]!.y;
      console.log(shape.startX, shape.points.at(2)!.x);
      drawEnhancedArrow(
        ctx,
        shape.startX,
        shape.startY,
        endX,
        endY,
        shape.strokeColor,
      );
    } else if (type === "ellipse") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const centerX = shape.startX + width / 2;
      const centerY = shape.startY + height / 2;
      const rx = Math.abs(width / 2);
      const ry = Math.abs(height / 2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
      if (shape.label) {
        ctx.fillStyle = oklchToCSS(shape.strokeColor);
        drawLabel(ctx, { x: centerX, y: centerY }, shape.label, width);
      }
      if (hasFillColor(shape))
        (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
      ctx.stroke();
    } else if (type === "rectangle") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const radius = Math.min(8, Math.abs(width) / 8, Math.abs(height) / 8);
      createRoundedRectPath(
        ctx,
        shape.startX,
        shape.startY,
        width,
        height,
        radius,
      );
      if (shape.label) {
        const centerY = shape.startY + height / 2;
        const centerX = shape.startX + width / 2;
        ctx.fillStyle = oklchToCSS(shape.strokeColor);
        drawLabel(ctx, { x: centerX, y: centerY }, shape.label, width);
      }
      if (hasFillColor(shape))
        (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
      ctx.stroke();
    } else if (type === "triangle") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const radius = Math.min(6, Math.abs(width) / 10, Math.abs(height) / 10);
      drawRoundedTriangle(
        ctx,
        shape.startX,
        shape.startY,
        width,
        height,
        radius,
      );
      if (hasFillColor(shape))
        (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
      ctx.stroke();
    } else if (type === "text") {
      drawText(ctx, shape);
    } else if (type === "line") {
      drawLine(ctx, shape.points);
    }
  } finally {
    ctx.restore();
  }

  // Selected → draw highlight (outline + resize handles)
  if (shape.id === selectedShapeId) {
    if (shape.type === "text") {
      const bounds = {
        x: shape.startX,
        y: shape.startY,
        width: shape.width,
        height: shape.height,
      };
      highlightShape(ctx, shape, bounds);
      return;
    }
    if (
      shape.type === "line" ||
      shape.type === "arrow" ||
      shape.type === "pencil" ||
      shape.type === "image"
    )
      return;

    if ("endX" in shape && "endY" in shape) {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const bounds = { x: shape.startX, y: shape.startY, width, height };
      highlightShape(ctx, shape, bounds);
    }
  }
};
