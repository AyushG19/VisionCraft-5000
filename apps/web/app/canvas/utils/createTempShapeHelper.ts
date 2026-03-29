import { DrawElement, PencilType, PointType, ShapeType } from "@repo/common";
import { DragStateType, ResizeStateType } from "../types";

export const createDraggedShape = (
  dragState: DragStateType,
  currMousePos: { x: number; y: number },
  shape: DrawElement,
): DrawElement => {
  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond" ||
    shape.type === "pencil"
  ) {
    const dx = shape.endX - shape.startX;
    const dy = shape.endY - shape.startY;
    const clampedX = currMousePos.x - dragState.offsetX;
    const clampedY = currMousePos.y - dragState.offsetY;
    
    return {
      ...shape,
      startX: clampedX,
      startY: clampedY,
      endX: clampedX + dx,
      endY: clampedY + dy,
    };
  } else if (shape.type === "text") {
    const dx = shape.width;
    const dy = shape.height;
    const clampedX = currMousePos.x - dragState.offsetX;
    const clampedY = currMousePos.y - dragState.offsetY;
    
    return {
      ...shape,
      startX: clampedX,
      startY: clampedY,
    };
  } else if (shape.type === "arrow" || shape.type === "line") {
    const dx = shape.points[2]!.x;
    const dy = shape.points[2]!.y;
    const clampedX = currMousePos.x - dragState.offsetX;
    const clampedY = currMousePos.y - dragState.offsetY;
    
    return {
      ...shape,
      startX: clampedX,
      startY: clampedY,
    };
  }
  return shape;
  // const dx = shape.endX - shape.startX;
  // const dy = shape.endY - shape.startY;
  // const clampedX = Math.max(
  //   0,
  //   Math.min(window.innerWidth - dx, currMousePos.x - dragState.offsetX),
  // );
  // const clampedY = Math.max(
  //   0,
  //   Math.min(window.innerHeight - dy, currMousePos.y - dragState.offsetY),
  // );

  // // if (shape.type === "PENCIL" && Array.isArray(shape.points)) {
  // //   const newPointsArray = shape.points.map((point) => ({
  // //     x: point.x - dragState.offsetX,
  // //     y: point.y - dragState.offsetY,
  // //   }));

  // //   return {
  // //     ...shape,
  // //     points: newPointsArray,
  // //   };
  // // }

  // return {
  //   ...shape,
  //   startX: clampedX,
  //   startY: clampedY,
  //   endX: clampedX + dx,
  //   endY: clampedY + dy,
  // };
};

type ResizableShape =
  | ShapeType // rectangle, ellipse, triangle
  | PencilType; // pencil (has endX/endY in your model)

function isResizableShape(shape: DrawElement): shape is ResizableShape {
  return (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond" ||
    shape.type === "pencil"
  );
}

export const createResizedShape = (
  resizeState: ResizeStateType,
  currPos: PointType,
  shape: DrawElement,
): DrawElement => {
  if (!isResizableShape(shape)) return shape;

  let newStartX = shape.startX;
  let newStartY = shape.startY;
  let newEndX = shape.endX;
  let newEndY = shape.endY;

  switch (resizeState.resizeDirection) {
    case "TOP":
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "BOTTOM":
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;

    case "LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      break;

    case "RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      break;

    case "TOP_LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "TOP_RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "BOTTOM_LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;

    case "BOTTOM_RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;
  }

  return {
    ...shape,
    startX: newStartX,
    startY: newStartY,
    endX: newEndX,
    endY: newEndY,
  };
};
