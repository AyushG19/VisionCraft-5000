import oklchToCSS from "../../lib/oklchToCss";
import { ImageType, PointType, TextType, type DrawElement } from "@repo/common";
import { drawHandles, drawLabel } from "app/lib/drawing.helpers";
import { Camera } from "../hooks/useCamera";
import { imageCache } from "./redrawPreviousShapes";

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

// Typ
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
  zoom: number,
) => {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([4 / zoom, 2 / zoom]);
  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 1 / zoom;

  ctx.strokeRect(
    bounds.x - 5 / zoom,
    bounds.y - 5 / zoom,
    bounds.width + 10 / zoom,
    bounds.height + 10 / zoom,
  );

  ctx.restore();

  // Draw resize handles
  drawHandles(
    ctx,
    {
      x: bounds.x - 5 / zoom,
      y: bounds.y - 5 / zoom,
      width: bounds.width + 10 / zoom,
      height: bounds.height + 10 / zoom,
    },
    undefined,
    zoom,
  );
};

const drawSmoothPencilPath = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  startPos: PointType,
  width: number,
  height: number,
  isNormalized: boolean,
): void => {
  if (points.length < 2) return;

  const getScreenPoint = (p: Point) => {
    if (isNormalized) {
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

  if (points.length === 2) {
    ctx.lineTo(p1.x, p1.y);
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = getScreenPoint(points[i]!);
    const nextPoint = getScreenPoint(points[i + 1]!);

    const controlX = currentPoint.x;
    const controlY = currentPoint.y;

    const endX = (currentPoint.x + nextPoint.x) / 2;
    const endY = (currentPoint.y + nextPoint.y) / 2;

    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  }

  const lastPoint = getScreenPoint(points[points.length - 1]!);
  ctx.lineTo(lastPoint.x, lastPoint.y);
};

const drawEnhancedArrow = (
  ctx: CanvasRenderingContext2D,
  points: readonly PointType[],
  startPos: PointType,
  fillColor?: ColorType | null,
): void => {
  const { x: startX, y: startY } = startPos;
  const secondEndX = startX + points[points.length - 2]!.x;
  const secondEndY = startY + points[points.length - 2]!.y;
  const endX = startX + points[points.length - 1]!.x;
  const endY = startY + points[points.length - 1]!.y;

  const width = endX - startX;
  const height = endY - startY;
  const length = Math.sqrt(width * width + height * height);

  const dx = endX - secondEndX;
  const dy = endY - secondEndY;
  const angle = Math.atan2(dy, dx);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  points.forEach((p) => {
    ctx.lineTo(startX + p.x, startY + p.y);
  });

  ctx.stroke();

  const headLength = Math.min(20, length * 0.2);

  const leftX = endX - headLength * Math.cos(angle - Math.PI / 8);
  const leftY = endY - headLength * Math.sin(angle - Math.PI / 8);
  const rightX = endX - headLength * Math.cos(angle + Math.PI / 8);
  const rightY = endY - headLength * Math.sin(angle + Math.PI / 8);

  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(leftX, leftY);
  ctx.moveTo(rightX, rightY);
  ctx.lineTo(endX, endY);
  ctx.closePath();

  if (fillColor) {
    // ctx.fillStyle = oklchToCSS(fillColor);
    // ctx.fill();
  }
  ctx.stroke();
};

const drawRoundedDiamond_ = (
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

  // vertices
  const top = { x: centerX, y: startY };
  const right = { x: endX, y: centerY };
  const bottom = { x: centerX, y: endY };
  const left = { x: startX, y: centerY };

  // Calculating edge lengths
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

  const topRightStart = getPointOnEdge(top, right, maxRadius);
  const topRightEnd = getPointOnEdge(right, top, maxRadius);

  const rightBottomStart = getPointOnEdge(right, bottom, maxRadius);
  const rightBottomEnd = getPointOnEdge(bottom, right, maxRadius);

  const bottomLeftStart = getPointOnEdge(bottom, left, maxRadius);
  const bottomLeftEnd = getPointOnEdge(left, bottom, maxRadius);

  const leftTopStart = getPointOnEdge(left, top, maxRadius);
  const leftTopEnd = getPointOnEdge(top, left, maxRadius);

  ctx.beginPath();

  ctx.moveTo(leftTopEnd.x, leftTopEnd.y);
  ctx.lineTo(topRightStart.x, topRightStart.y);
  ctx.quadraticCurveTo(top.x, top.y, topRightEnd.x, topRightEnd.y);

  ctx.lineTo(rightBottomStart.x, rightBottomStart.y);
  ctx.quadraticCurveTo(right.x, right.y, rightBottomEnd.x, rightBottomEnd.y);

  ctx.lineTo(bottomLeftStart.x, bottomLeftStart.y);
  ctx.quadraticCurveTo(bottom.x, bottom.y, bottomLeftEnd.x, bottomLeftEnd.y);

  ctx.lineTo(leftTopStart.x, leftTopStart.y);
  ctx.quadraticCurveTo(left.x, left.y, leftTopEnd.x, leftTopEnd.y);

  ctx.closePath();
};
export const drawRoundedRhombus = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 10,
  zoom: number = 1,
  isSelectionUI: boolean = false,
) => {
  const cx = x + width / 2;
  const cy = y + height / 2;

  const top = { x: cx, y };
  const right = { x: x + width, y: cy };
  const bottom = { x: cx, y: y + height };
  const left = { x, y: cy };

  // 1. Calculate desired radius based on zoom (grows huge when zooming out)
  const targetRadius = isSelectionUI ? radius / zoom : radius;

  // 2. THE FIX: Protect the shape's geometry!
  // The radius can safely be at most 25% of the shortest side.
  // If we exceed this, arcTo() will glitch and turn inside out.
  const maxSafeRadius = Math.min(width, height) * 0.25;
  const activeRadius = Math.min(radius, maxSafeRadius); // Clamp it

  const activeLineWidth = isSelectionUI ? 2 / zoom : 2;

  ctx.save();
  ctx.beginPath();

  // Start EXACTLY at the midpoint of the top-right edge
  ctx.moveTo(x + width * 0.75, y + height * 0.25);

  // Draw the corners safely
  ctx.arcTo(right.x, right.y, bottom.x, bottom.y, activeRadius);
  ctx.arcTo(bottom.x, bottom.y, left.x, left.y, activeRadius);
  ctx.arcTo(left.x, left.y, top.x, top.y, activeRadius);
  ctx.arcTo(top.x, top.y, right.x, right.y, activeRadius);

  ctx.closePath();

  ctx.lineWidth = activeLineWidth;
  ctx.lineJoin = "round"; // Hides sharp glitches if they somehow happen
  ctx.stroke();
  ctx.restore();
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
  camera: Camera,
  selectedShapeId?: string,
): void => {
  if (!ctx || !shape) return;
  const zoom = camera?.z ?? 1;
  const type = shape.type;

  // convert color
  let strokeColor = "white";
  try {
    if (shape.strokeColor) strokeColor = oklchToCSS(shape.strokeColor);
  } catch (e) {
    console.warn("Invalid lineColor", e);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = hasLineWidth(shape) ? shape.lineWidth / zoom : 2 / zoom;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.save();
  try {
    if (type === "pencil") {
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
    if (type === "arrow") {
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
      // createRoundedRectPath(
      //   ctx,
      //   shape.startX,
      //   shape.startY,
      //   width,
      //   height,
      //   radius,
      // );
      ctx.roundRect(shape.startX, shape.startY, width, height, 20);
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
      const radius = Math.min(
        6 * camera.z,
        (Math.abs(width) * camera.z) / 10,
        (Math.abs(height) * camera.z) / 10,
      );
      drawRoundedRhombus(
        ctx,
        shape.startX,
        shape.startY,
        width,
        height,
        20,
        camera.z,
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
    } else if (type === "image") {
      drawImageShape(ctx, shape, imageCache);
    }
  } finally {
    ctx.restore();
  }

  if (shape.id === selectedShapeId) {
    if (shape.type === "text" || shape.type === "image") {
      const bounds = {
        x: shape.startX,
        y: shape.startY,
        width: shape.width,
        height: shape.height,
      };
      highlightShape(ctx, shape, bounds, zoom);
      return;
    }

    if (
      shape.type === "line" ||
      shape.type === "arrow" ||
      shape.type === "pencil"
    )
      return;

    if ("endX" in shape && "endY" in shape) {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const bounds = { x: shape.startX, y: shape.startY, width, height };
      highlightShape(ctx, shape, bounds, zoom);
    }
  }
};

export const drawImageShape = (
  ctx: CanvasRenderingContext2D,
  shape: ImageType,
  imageCache?: Map<string, ImageBitmap | Promise<ImageBitmap>>,
  onLoad?: () => void, // triggers re-render after bitmap loads
) => {
  if (!imageCache) return;

  const cached = imageCache.get(shape.id);
  ctx.lineWidth = shape.strokeWidth || 5;
  ctx.strokeStyle = oklchToCSS(shape.strokeColor) || "white";
  // ✅ Already ready — draw immediately
  if (cached instanceof ImageBitmap) {
    ctx.drawImage(
      cached,
      shape.startX,
      shape.startY,
      shape.width,
      shape.height,
    );
    return;
  }

  // ⏳ Already loading — do nothing, wait for resolve
  if (cached instanceof Promise) return;

  // 🔴 Not in cache yet — if has cloudinary link, load from URL
  if (shape.link) {
    const promise = fetch(shape.link)
      .then((r) => r.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bm) => {
        imageCache.set(shape.id, bm);
        onLoad?.(); // trigger one redraw
        return bm;
      });
    imageCache.set(shape.id, promise); // block duplicate calls
    return;
  }
};
