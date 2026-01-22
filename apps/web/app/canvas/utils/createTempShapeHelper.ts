import { ShapeType } from "@repo/common";
import { DragStateType, ResizeStateType } from "../types";

export const createDraggedShape = (
  dragState: DragStateType,
  currMousePos: { x: number; y: number },
  shape: ShapeType,
): ShapeType => {
  const dx = shape.endX - shape.startX;
  const dy = shape.endY - shape.startY;
  const clampedX = Math.max(
    0,
    Math.min(window.innerWidth - dx, currMousePos.x - dragState.offsetX),
  );
  const clampedY = Math.max(
    0,
    Math.min(window.innerHeight - dy, currMousePos.y - dragState.offsetY),
  );

  // if (shape.type === "PENCIL" && Array.isArray(shape.points)) {
  //   const newPointsArray = shape.points.map((point) => ({
  //     x: point.x - dragState.offsetX,
  //     y: point.y - dragState.offsetY,
  //   }));

  //   return {
  //     ...shape,
  //     points: newPointsArray,
  //   };
  // }

  return {
    ...shape,
    isNormalized: shape.type === "PENCIL" ? true : false,
    startX: clampedX,
    startY: clampedY,
    endX: clampedX + dx,
    endY: clampedY + dy,
  };
};
export const createResizedShape = (
  resizeState: ResizeStateType,
  currPos: { x: number; y: number },
  shape: ShapeType,
): ShapeType => {
  let newShape;
  let newEndX = 0,
    newEndY = 0,
    newStartX = 0,
    newStartY = 0,
    startX = 0,
    endX = 0,
    startY = 0,
    endY = 0;
  switch (resizeState.resizeDirection) {
    case "TOP":
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y > endY ? endY : currPos.y;
      newEndY = currPos.y > endY ? currPos.y : endY;

      newShape = {
        ...shape,
        startY: newStartY,
        endY: newEndY,
      };

      break;

    case "RIGHT":
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x < startX ? currPos.x : startX;
      newEndX = currPos.x < startX ? startX : currPos.x;

      newShape = {
        ...shape,
        startX: newStartX,
        endX: newEndX,
      };
      break;

    case "BOTTOM":
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y < startY ? currPos.y : startY;
      newEndY = currPos.y < startY ? startY : currPos.y;

      newShape = {
        ...shape,
        startY: newStartY,
        endY: newEndY,
      };

      break;

    case "LEFT":
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x > endX ? endX : currPos.x;
      newEndX = currPos.x > endX ? currPos.x : endX;

      newShape = {
        ...shape,
        startX: newStartX,
        endX: newEndX,
      };

      break;

    case "TOP_RIGHT":
      //logic from top
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y > endY ? endY : currPos.y;
      newEndY = currPos.y > endY ? currPos.y : endY;

      //logic from right
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x < startX ? currPos.x : startX;
      newEndX = currPos.x < startX ? startX : currPos.x;

      newShape = {
        ...shape,
        startY: newStartY,
        endY: newEndY,
        startX: newStartX,
        endX: newEndX,
      };
      break;

    case "TOP_LEFT":
      //logic from top
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y > endY ? endY : currPos.y;
      newEndY = currPos.y > endY ? currPos.y : endY;

      //from left logic
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x > endX ? endX : currPos.x;
      newEndX = currPos.x > endX ? currPos.x : endX;

      newShape = {
        ...shape,
        startY: newStartY,
        endY: newEndY,
        startX: newStartX,
        endX: newEndX,
      };
      break;

    case "BOTTOM_LEFT":
      //from bottom logic
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y < startY ? currPos.y : startY;
      newEndY = currPos.y < startY ? startY : currPos.y;

      //from left logic
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x > endX ? endX : currPos.x;
      newEndX = currPos.x > endX ? currPos.x : endX;

      newShape = {
        ...shape,
        startY: newStartY,
        endY: newEndY,
        startX: newStartX,
        endX: newEndX,
      };

      break;

    case "BOTTOM_RIGHT":
      //from bottom logic
      startY = shape.startY;
      endY = shape.endY;

      newStartY = currPos.y < startY ? currPos.y : startY;
      newEndY = currPos.y < startY ? startY : currPos.y;

      //from right logic
      startX = shape.startX;
      endX = shape.endX;

      newStartX = currPos.x < startX ? currPos.x : startX;
      newEndX = currPos.x < startX ? startX : currPos.x;

      newShape = {
        ...shape,
        startX: newStartX,
        endX: newEndX,
        startY: newStartY,
        endY: newEndY,
      };
      break;
  }
  return newShape ? newShape : shape;
};
