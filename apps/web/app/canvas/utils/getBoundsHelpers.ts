import { DrawElement, ShapeType } from "@repo/common";
import { Bounds } from "../../lib/getHandles";

export const getOutlineBounds = (shape: DrawElement): Bounds => {
  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "triangle"
  ) {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.endX - shape.startX,
      height: shape.endY - shape.startY,
    };
  } else if (shape.type === "line") {
  } else if (shape.type === "image") {
  } else if (shape.type === "text") {
  } else {
  }
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
};
export const getBoundsForHandles = (shape: DrawElement): Bounds => {
  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "triangle"
  ) {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.endX - shape.startX,
      height: shape.endY - shape.startY,
    };
  }
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
};
