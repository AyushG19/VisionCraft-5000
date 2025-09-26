import { useCallback } from "react";
import oklchToCSS from "./oklchToCss";
import { type ShapeType } from "@repo/common/types";

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
  const left = Math.min(x, x + width);
  const right = Math.max(x, x + width);
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);

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
  const headLength = Math.min(20, length * 0.3);
  const headWidth = headLength * 0.6;

  // Calculate arrowhead points with better proportions
  const arrowX = endX;
  const arrowY = endY;
  const leftX = arrowX - headLength * Math.cos(angle - Math.PI / 6);
  const leftY = arrowY - headLength * Math.sin(angle - Math.PI / 6);
  const rightX = arrowX - headLength * Math.cos(angle + Math.PI / 6);
  const rightY = arrowY - headLength * Math.sin(angle + Math.PI / 6);

  // Draw filled arrowhead with rounded joins
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = oklchToCSS(fillColor);
    ctx.fill();
  }
  ctx.stroke();
};

// Helper function for enhanced triangle with rounded corners
const drawRoundedTriangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 6
): void => {
  // Normalize coordinates to handle drawing in any direction
  const left = Math.min(x, x + width);
  const right = Math.max(x, x + width);
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);

  const actualWidth = right - left;
  const actualHeight = bottom - top;

  // Calculate the three vertices of the triangle (always consistent regardless of draw direction)
  const topX = left + actualWidth / 2;
  const topY = top;
  const leftX = left;
  const leftY = bottom;
  const rightX = right;
  const rightY = bottom;

  // Clamp radius to prevent overlapping curves
  const maxRadius = Math.min(radius, actualWidth / 6, actualHeight / 6);

  if (maxRadius <= 0) {
    // Fallback to sharp triangle if radius is too small
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(leftX, leftY);
    ctx.closePath();
    return;
  }

  ctx.beginPath();

  // Calculate angles between vertices
  const topToRightAngle = Math.atan2(rightY - topY, rightX - topX);
  const topToLeftAngle = Math.atan2(leftY - topY, leftX - topX);
  const rightToLeftAngle = Math.atan2(leftY - rightY, leftX - rightX);

  // Calculate offset points for rounded corners at each vertex

  // Top vertex offsets
  const topRightOffsetX = topX + maxRadius * Math.cos(topToRightAngle);
  const topRightOffsetY = topY + maxRadius * Math.sin(topToRightAngle);
  const topLeftOffsetX = topX + maxRadius * Math.cos(topToLeftAngle);
  const topLeftOffsetY = topY + maxRadius * Math.sin(topToLeftAngle);

  // Right vertex offsets
  const rightTopOffsetX = rightX - maxRadius * Math.cos(topToRightAngle);
  const rightTopOffsetY = rightY - maxRadius * Math.sin(topToRightAngle);
  const rightLeftOffsetX = rightX + maxRadius * Math.cos(rightToLeftAngle);
  const rightLeftOffsetY = rightY + maxRadius * Math.sin(rightToLeftAngle);

  // Left vertex offsets
  const leftRightOffsetX = leftX - maxRadius * Math.cos(rightToLeftAngle);
  const leftRightOffsetY = leftY - maxRadius * Math.sin(rightToLeftAngle);
  const leftTopOffsetX = leftX - maxRadius * Math.cos(topToLeftAngle);
  const leftTopOffsetY = leftY - maxRadius * Math.sin(topToLeftAngle);

  // Start the path from top-right offset
  ctx.moveTo(topRightOffsetX, topRightOffsetY);

  // Line to right vertex (approaching from top)
  ctx.lineTo(rightTopOffsetX, rightTopOffsetY);

  // Rounded corner at right vertex
  ctx.quadraticCurveTo(rightX, rightY, rightLeftOffsetX, rightLeftOffsetY);

  // Line to left vertex (approaching from right)
  ctx.lineTo(leftRightOffsetX, leftRightOffsetY);

  // Rounded corner at left vertex
  ctx.quadraticCurveTo(leftX, leftY, leftTopOffsetX, leftTopOffsetY);

  // Line back to top vertex (approaching from left)
  ctx.lineTo(topLeftOffsetX, topLeftOffsetY);

  // Rounded corner at top vertex
  ctx.quadraticCurveTo(topX, topY, topRightOffsetX, topRightOffsetY);

  ctx.closePath();
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: ShapeType
): void => {
  // Early return for invalid shapes
  if (!ctx || !shape) {
    console.warn("Invalid context or shape provided to drawShape");
    return;
  }

  // Type-safe coordinate access
  if (
    typeof shape.startX !== "number" ||
    typeof shape.startY !== "number" ||
    typeof shape.endX !== "number" ||
    typeof shape.endY !== "number"
  ) {
    console.warn("Invalid shape coordinates");
    return;
  }

  const width = shape.endX - shape.startX;
  const height = shape.endY - shape.startY;

  // Validate shape has required lineColor
  if (!shape.lineColor) {
    console.warn("Shape missing required lineColor");
    return;
  }

  // Set common styles with type safety
  try {
    ctx.strokeStyle = oklchToCSS(shape.lineColor);
  } catch (error) {
    console.warn("Invalid lineColor format:", error);
    return;
  }

  // Set line width with type checking
  const lineWidth = hasLineWidth(shape) ? shape.lineWidth : 2;
  if (lineWidth <= 0) {
    console.warn("Invalid line width, using default");
    ctx.lineWidth = 2;
  } else {
    ctx.lineWidth = lineWidth;
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Add subtle shadow for depth
  ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  try {
    switch (shape.type) {
      case "PENCIL":
        if (hasPoints(shape)) {
          ctx.shadowBlur = 0; // Disable shadow for pencil
          drawSmoothPencilPath(ctx, shape.points);
          ctx.stroke();
        } else {
          console.warn("PENCIL shape missing points array");
        }
        break;

      case "ARROW": {
        const fillColor = hasFillColor(shape) ? shape.fillColor : null;
        drawEnhancedArrow(
          ctx,
          shape.startX,
          shape.startY,
          shape.endX,
          shape.endY,
          fillColor
        );
        break;
      }

      case "CIRCLE": {
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);

        if (radiusX <= 0 || radiusY <= 0) {
          console.warn("Invalid circle dimensions");
          break;
        }

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

        // Fill if specified
        if (hasFillColor(shape)) {
          try {
            ctx.fillStyle = oklchToCSS(shape.fillColor);
            ctx.fill();
          } catch (error) {
            console.warn("Invalid fillColor format:", error);
          }
        }
        ctx.stroke();
        break;
      }

      case "SQUARE": {
        if (width === 0 || height === 0) {
          console.warn("Invalid rectangle dimensions");
          break;
        }

        const radius = Math.min(8, Math.abs(width) / 8, Math.abs(height) / 8);
        createRoundedRectPath(
          ctx,
          shape.startX,
          shape.startY,
          width,
          height,
          radius
        );

        // Fill if specified
        if (hasFillColor(shape)) {
          try {
            ctx.fillStyle = oklchToCSS(shape.fillColor);
            ctx.fill();
          } catch (error) {
            console.warn("Invalid fillColor format:", error);
          }
        }
        ctx.stroke();
        break;
      }

      case "TRIANGLE": {
        if (width === 0 || height === 0) {
          console.warn("Invalid triangle dimensions");
          break;
        }

        const radius = Math.min(6, Math.abs(width) / 10, Math.abs(height) / 10);
        drawRoundedTriangle(
          ctx,
          shape.startX,
          shape.startY,
          width,
          height,
          radius
        );

        // Fill if specified
        if (hasFillColor(shape)) {
          try {
            ctx.fillStyle = oklchToCSS(shape.fillColor);
            ctx.fill();
          } catch (error) {
            console.warn("Invalid fillColor format:", error);
          }
        }
        ctx.stroke();
        break;
      }

      case "REDO":
      case "UNDO":
        // These don't need drawing logic
        break;

      default:
        // Type-safe exhaustive check
        const _exhaustiveCheck: any = shape.type;
        console.warn(`Unknown shape type: ${String(shape.type)}`);
    }
  } catch (error) {
    console.error("Error drawing shape:", error);
  } finally {
    // Always reset shadow to prevent bleeding to other shapes
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
};
