import {
  AllToolTypes,
  DrawElement,
  LineTool,
  PencilToolType,
  ShapeTool,
  ShapeType,
} from "@repo/common";

export const isStokeElement = (
  tool: AllToolTypes,
): tool is ShapeTool | LineTool | PencilToolType => {
  if (
    tool === "image" ||
    tool === "color" ||
    tool === "hand" ||
    tool === "select" ||
    tool === "text"
  )
    return false;
  return true;
};

export const isText = (tool: AllToolTypes) => {
  if (tool === "text") return true;

  return false;
};

export const isShape = (tool: AllToolTypes): tool is ShapeTool => {
  if (tool === "rectangle" || tool === "diamond" || tool === "ellipse")
    return true;
  return false;
};
