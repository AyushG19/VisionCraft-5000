import {
  AllToolTypes,
  ColorType,
  DrawElement,
  LinearType,
  LineTool,
  PencilToolType,
  PencilType,
  PointType,
  ShapeTool,
  ShapeType,
  TextStateType,
  TextType,
  ToolKitType,
} from "@repo/common";

export function createNewShape(
  toolKitState: ToolKitType,
  startPos: PointType,
  currentPos: PointType,
): DrawElement {
  // if (content) {
  //   return {
  //     id: crypto.randomUUID(),
  //     startX: startPos.x,
  //     startY: startPos.y,
  //     strokeWidth: strokeWidth,
  //     strokeColor: strokeColor,
  //     backgroundColor: null,
  //     isDeleted: false,
  //     type: type,
  //     endX: currentPos.x,
  //     endY: currentPos.y,
  //     // label?:
  //     // fillColor?:
  //   };
  // }
  const type = toolKitState.currentTool;
  if (type === "arrow") {
    return {
      id: crypto.randomUUID(),
      startX: startPos.x,
      startY: startPos.y,
      points: [
        { x: startPos.x, y: startPos.y },
        { x: currentPos.x, y: currentPos.y },
        { x: currentPos.x, y: currentPos.y },
      ],
      strokeWidth: toolKitState.strokeSize,
      strokeColor: toolKitState.currentColor,
      backgroundColor: null,
      isDeleted: false,
      type: type,
    } as LinearType;
  } else if (type === "line") {
    return {
      id: crypto.randomUUID(),
      startX: startPos.x,
      startY: startPos.y,
      points: [
        { x: startPos.x, y: startPos.y },
        { x: currentPos.x, y: currentPos.y },
        { x: currentPos.x, y: currentPos.y },
      ],
      strokeWidth: toolKitState.strokeSize,
      strokeColor: toolKitState.currentColor,
      backgroundColor: null,
      isDeleted: false,
      type: type,
    } as LinearType;
  } else if (
    type === "rectangle" ||
    type === "ellipse" ||
    type === "triangle"
  ) {
    return {
      id: crypto.randomUUID(),
      startX: Math.min(startPos.x, currentPos.x),
      startY: Math.min(startPos.y, currentPos.y),
      strokeWidth: toolKitState.strokeSize,
      strokeColor: toolKitState.currentColor,
      backgroundColor: null,
      isDeleted: false,
      type: type,
      endX: Math.max(startPos.x, currentPos.x),
      endY: Math.max(startPos.y, currentPos.y),
      // label?:
      // fillColor?:
    } as ShapeType;
  } else {
    return {
      id: crypto.randomUUID(),
      startX: currentPos.x,
      startY: currentPos.y,
      endX: currentPos.x,
      endY: currentPos.y,
      strokeWidth: toolKitState.strokeSize,
      strokeColor: toolKitState.currentColor,
      backgroundColor: null,
      isDeleted: false,
      type: "pencil",
      points: [currentPos],
      // startBinding?: any;
      // endBinding?: any;
    } as PencilType;
  }
  // default:
  //   shape = {
  //   id: crypto.randomUUID(),
  //   startX: startPos.x,
  //   startY: startPos.y,
  //   strokeWidth: strokeWidth,
  //   strokeColor: strokeColor,
  //   backgroundColor: null,
  //   isDeleted: false,
  //   type: type,
  //   endX: currentPos.x,
  //   endY: currentPos.y,
  // label?:
  // fillColor?:
}

export function createNewText(
  toolKitState: ToolKitType,
  textState: TextStateType,
  startPos: PointType,
  text: string,
  width: number,
  height: number,
) {
  return {
    backgroundColor: toolKitState.currentColor,
    fontFamily: textState.fontFamily,
    fontSize: textState.fontSize,
    id: crypto.randomUUID(),
    isDeleted: false,
    startX: startPos.x,
    startY: startPos.y,
    width: width,
    height: height,
    strokeColor: toolKitState.currentColor,
    strokeWidth: toolKitState.strokeSize,
    text: text,
    textAlign: textState.alignment,
    type: "text",
  } as TextType;
}

export function createNewLinear(
  type: LineTool,
  strokeWidth: number,
  strokeColor: ColorType,
  currentPos: { x: number; y: number },
  content?: string,
): LinearType {
  return {
    id: crypto.randomUUID(),
    startX: currentPos.x,
    startY: currentPos.y,
    strokeWidth: strokeWidth,
    strokeColor: strokeColor,
    backgroundColor: null,
    isDeleted: false,
    type: type,
    points: [currentPos],
    // startBinding?: any;
    // endBinding?: any;
  };
}

export function createNewPencil(
  currentPos: PointType,
  strokeWidth: number,
  strokeColor: ColorType,
): PencilType {
  return {
    id: crypto.randomUUID(),
    startX: currentPos.x,
    startY: currentPos.y,
    endX: currentPos.x,
    endY: currentPos.y,
    strokeWidth: strokeWidth,
    strokeColor: strokeColor,
    backgroundColor: null,
    isDeleted: false,
    isNormalized: false,
    type: "pencil",
    points: [currentPos],
    // startBinding?: any;
    // endBinding?: any;
  };
}

export function updatePencil(
  currentPos: { x: number; y: number },
  lastShape: PencilType,
): PencilType {
  if (!lastShape || lastShape.type !== "pencil") return lastShape;
  const points = lastShape.points || [];
  const lastPoint = points[points.length - 1];

  // 1. CHECK DISTANCE
  if (lastPoint) {
    const dist = Math.hypot(
      currentPos.x - lastPoint.x,
      currentPos.y - lastPoint.y,
    );
    // If moved less than 5 pixels, ignore this update!
    if (dist < 5) {
      return lastShape;
    }
  }

  const updatedPoints = [...(lastShape.points || []), currentPos];
  return {
    ...lastShape,
    points: updatedPoints,
    startX: Math.min(currentPos.x, lastShape.startX),
    startY: Math.min(currentPos.y, lastShape.startY),
    endX: Math.max(currentPos.x, lastShape.endX),
    endY: Math.max(currentPos.y, lastShape.endY),
  };
}

export function finishPencil(shape: PencilType) {
  if (!shape || !Array.isArray(shape.points)) return shape;

  // 1. FIND THE TRUE BOUNDS from the points array
  // We cannot trust shape.startX/endX because the user might have scribbled outside that line.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // shape.points!.forEach((p) => {
  //   if (p.x < minX) minX = p.x;
  //   if (p.y < minY) minY = p.y;
  //   if (p.x > maxX) maxX = p.x;
  //   if (p.y > maxY) maxY = p.y;
  // });

  // const width = maxX - minX;
  // const height = maxY - minY;

  const width = shape.endX - shape.startX;
  const height = shape.endY - shape.startY;

  const safeW = width === 0 ? 1 : width;
  const safeH = height === 0 ? 1 : height;

  // 2. Normalize based on the TRUE bounds
  const normalizedPoints = shape.points!.map((p) => ({
    x: (p.x - shape.startX) / safeW, // This will guaranteed be 0.0 to 1.0
    y: (p.y - shape.startY) / safeH,
  }));

  // 3. Update the shape with the NEW bounds and normalized points
  return {
    ...shape,
    points: normalizedPoints,
    isNormalized: true,
  };
}
