import { ShapeType } from "@repo/common";

export const getOutlineBounds = (shape: ShapeType) => {
  return {
    x: shape.startX,
    y: shape.startY,
    width: shape.endX - shape.startX,
    height: shape.endY - shape.startY,
  };
};
export const getBoundsForHandles = (shape: ShapeType) => {
  return {
    x: shape.startX - 5,
    y: shape.startY - 5,
    height: shape.endY - shape.startY + 10,
    width: shape.endX - shape.startX + 10,
  };
};
