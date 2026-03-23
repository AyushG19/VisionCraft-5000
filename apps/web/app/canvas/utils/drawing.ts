import oklchToCSS from "../../lib/oklchToCss";
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
import { formToJSON } from "axios";

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
  points: readonly PointType[],
  startPos: PointType,
  fillColor?: ColorType | null,
): void => {
  const { x: startX, y: startY } = startPos;
  const secondEndX = points.at(-2)!.x;
  const secondEndY = points.at(-2)!.y;
  const endX = points.at(-1)!.x;
  const endY = points.at(-1)!.y;

  const width = startX + endX - startX + secondEndX;
  const height = startY + endY - startY + secondEndY;
  const angle = Math.atan2(height, width);
  const length = Math.sqrt(width * width + height * height);

  // Don't draw if too short
  // if (length < 10) return;

  // Enhanced arrow shaft with rounded ends
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  points.forEach((p) => {
    ctx.lineTo(startX + p.x, startY + p.y);
  });

  ctx.stroke();

  // Dynamic arrowhead size based on arrow length
  const headLength = Math.min(20, length * 0.2);

  // Calculate arrowhead points with better proportions
  const arrowX = startX + endX;
  const arrowY = startY + endY;
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

const drawRoundedDiamond = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  radius: number = 4,
): void => {
  const width = endX - startX;
  const height = endY - startY;

  const centerX = startX + width / 2;
  const centerY = startY + height / 2;

  // Diamond vertices
  const top = { x: centerX, y: startY };
  const right = { x: endX, y: centerY };
  const bottom = { x: centerX, y: endY };
  const left = { x: startX, y: centerY };

  // Calculate edge lengths
  const topToRight = Math.sqrt(
    Math.pow(right.x - top.x, 2) + Math.pow(right.y - top.y, 2),
  );
  const rightToBottom = Math.sqrt(
    Math.pow(bottom.x - right.x, 2) + Math.pow(bottom.y - right.y, 2),
  );
  const bottomToLeft = Math.sqrt(
    Math.pow(left.x - bottom.x, 2) + Math.pow(left.y - bottom.y, 2),
  );
  const leftToTop = Math.sqrt(
    Math.pow(top.x - left.x, 2) + Math.pow(top.y - left.y, 2),
  );

  const minEdge = Math.min(topToRight, rightToBottom, bottomToLeft, leftToTop);
  const maxRadius = Math.min(radius, minEdge / 3);

  if (maxRadius <= 0.5 || minEdge < 10) {
    // Sharp diamond fallback
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    return;
  }

  // Helper function to calculate point along edge
  const getPointOnEdge = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    distance: number,
  ) => {
    const edgeLen = Math.sqrt(
      Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
    );
    const ratio = distance / edgeLen;
    return {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
  };

  // Calculate arc start/end points for each corner
  const topRightStart = getPointOnEdge(top, right, maxRadius);
  const topRightEnd = getPointOnEdge(right, top, maxRadius);

  const rightBottomStart = getPointOnEdge(right, bottom, maxRadius);
  const rightBottomEnd = getPointOnEdge(bottom, right, maxRadius);

  const bottomLeftStart = getPointOnEdge(bottom, left, maxRadius);
  const bottomLeftEnd = getPointOnEdge(left, bottom, maxRadius);

  const leftTopStart = getPointOnEdge(left, top, maxRadius);
  const leftTopEnd = getPointOnEdge(top, left, maxRadius);

  ctx.beginPath();

  // Start at first point
  ctx.moveTo(leftTopEnd.x, leftTopEnd.y);

  // Draw to top corner and arc around it
  ctx.lineTo(topRightStart.x, topRightStart.y);
  ctx.quadraticCurveTo(top.x, top.y, topRightEnd.x, topRightEnd.y);

  // Draw to right corner and arc around it
  ctx.lineTo(rightBottomStart.x, rightBottomStart.y);
  ctx.quadraticCurveTo(right.x, right.y, rightBottomEnd.x, rightBottomEnd.y);

  // Draw to bottom corner and arc around it
  ctx.lineTo(bottomLeftStart.x, bottomLeftStart.y);
  ctx.quadraticCurveTo(bottom.x, bottom.y, bottomLeftEnd.x, bottomLeftEnd.y);

  // Draw to left corner and arc around it
  ctx.lineTo(leftTopStart.x, leftTopStart.y);
  ctx.quadraticCurveTo(left.x, left.y, leftTopEnd.x, leftTopEnd.y);

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
function drawLine(
  ctx: CanvasRenderingContext2D,
  startPos: PointType,
  points: readonly PointType[],
) {
  const { x: startX, y: startY } = startPos;
  const endPos = points[2]!;
  const endX = startX + endPos.x;
  const endY = startY + endPos.y;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
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
      console.log(shape.startX, shape.points[2]!.x);
      drawEnhancedArrow(
        ctx,
        shape.points,
        { x: shape.startX, y: shape.startY },
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
    } else if (type === "diamond") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const radius = Math.min(6, Math.abs(width) / 10, Math.abs(height) / 10);
      drawRoundedDiamond(
        ctx,
        shape.startX,
        shape.startY,
        shape.endX,
        shape.endY,
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
    } else if (type === "text") {
      drawText(ctx, shape);
    } else if (type === "line") {
      drawLine(ctx, { x: shape.startX, y: shape.startY }, shape.points);
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
