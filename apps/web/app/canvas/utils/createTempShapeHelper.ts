import { ShapeType } from "@repo/common/types";
import { DragStateType, ResizeStateType } from "../types";

export const createDraggedShape = (
  dragState: DragStateType,
  currMousePos: { x: number; y: number },
  shape: ShapeType
): ShapeType => {
  const dx = shape.endX - shape.startX;
  const dy = shape.endY - shape.startY;
  const clampedX = Math.max(
    0,
    Math.min(window.innerWidth - dx, currMousePos.x - dragState.offsetX)
  );
  const clampedY = Math.max(
    0,
    Math.min(window.innerHeight - dy, currMousePos.y - dragState.offsetY)
  );
  return {
    ...shape,
    startX: clampedX,
    startY: clampedY,
    endX: clampedX + dx,
    endY: clampedY + dy,
  };
};
export const createResizedShape = (
  resizeState: ResizeStateType,
  currPos: { x: number; y: number },
  shape: ShapeType
): ShapeType => {
  let newShape;
  let clampedEndX = 0,
    clampedEndY = 0,
    clampedStartX = 0,
    clampedStartY = 0;
  switch (resizeState.resizeDirection) {
    case "TOP":
      clampedStartY = Math.min(currPos.y, shape.endY);
      newShape = {
        ...shape,
        startY: clampedStartY,
      };
      break;
    case "BOTTOM":
      clampedEndY = Math.max(currPos.y, shape.startY);
      newShape = {
        ...shape,
        endY: clampedEndY,
      };
      break;
    case "LEFT":
      clampedStartX = Math.min(currPos.x, shape.endX);
      newShape = {
        ...shape,
        startX: clampedStartX,
      };
      break;
    case "RIGHT":
      clampedEndX = Math.max(currPos.x, shape.startX);
      newShape = {
        ...shape,
        endX: clampedEndX,
      };
      break;
    case "TOP_LEFT":
      clampedStartY = Math.min(currPos.y, shape.endY);
      clampedStartX = Math.min(currPos.x, shape.endX);
      newShape = {
        ...shape,
        startX: clampedStartX,
        startY: clampedStartY,
      };
      break;
    case "TOP_RIGHT":
      clampedStartY = Math.min(currPos.y, shape.endY);
      clampedEndX = Math.max(currPos.x, shape.startX);
      newShape = {
        ...shape,
        startY: clampedStartY,
        endX: clampedEndX,
      };
      break;
    case "BOTTOM_LEFT":
      clampedEndY = Math.max(currPos.y, shape.startY);
      clampedStartX = Math.min(currPos.x, shape.endX);
      newShape = {
        ...shape,
        endY: clampedEndY,
        startX: clampedStartX,
      };
      break;
    case "BOTTOM_RIGHT":
      clampedEndY = Math.max(currPos.y, shape.startY);
      clampedEndX = Math.max(currPos.x, shape.startX);
      newShape = {
        ...shape,
        endY: clampedEndY,
        endX: clampedEndX,
      };
      break;
  }
  return newShape ? newShape : shape;
};
