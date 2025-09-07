import { useCallback } from "react";
import { Shape } from "../types";
import oklchToCSS from "./oklchToCss";

export const drawShape = useCallback(
  (ctx: CanvasRenderingContext2D, shape: Shape) => {
    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;
    ctx.beginPath();
    ctx.strokeStyle = oklchToCSS(shape.lineColor);
    switch (shape.type) {
      case "pencil":
        if (shape.points && shape.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
          }
          ctx.stroke();
        }
        break;
      case "arrow":
        const angle = Math.atan2(height, width);
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();

        //Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - 15 * Math.cos(angle - Math.PI / 7),
          shape.endY - 15 * Math.sin(angle - Math.PI / 7)
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - 15 * Math.cos(angle + Math.PI / 7),
          shape.endY - 15 * Math.sin(angle + Math.PI / 7)
        );
        ctx.stroke();
        break;
      case "circle":
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "square":
        ctx.strokeRect(shape.startX, shape.startY, width, height);
        break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(shape.endX - width / 2, shape.startY);
        ctx.lineTo(shape.endX - width, shape.startY + height);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.closePath();
        ctx.stroke();
        break;
      case "redo":
      case "undo":
    }
  },
  []
);
