import { ShapeType,ToolState } from "@repo/common";

export function createNewShape(
  toolState: ToolState,
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number },
  shapeToCopy?: ShapeType,
  content?: string,
): ShapeType {
  if (content) {
    return {
      id: crypto.randomUUID(),
      type: toolState.currentTool,
      lineWidth: toolState.brushSize,
      lineColor: toolState.currentColor,
      content: content,
      isNormalized: false,
      selected: false,
      startX: startPos.x,
      startY: startPos.y,
      endX: startPos.x,
      endY: startPos.y,
    };
  }
  switch (toolState.currentTool) {
    case "PENCIL": {
      return {
        id: crypto.randomUUID(),
        type: toolState.currentTool,
        lineWidth: toolState.brushSize,
        lineColor: toolState.currentColor,
        selected: false,
        isNormalized: false,
        startX: startPos.x,
        startY: startPos.y,
        endX: currentPos.x,
        endY: currentPos.y,
        points: [startPos],
      };
    }
    default: {
      return {
        id: crypto.randomUUID(),
        type: toolState.currentTool,
        lineWidth: toolState.brushSize,
        lineColor: toolState.currentColor,
        selected: false,
        isNormalized: false,
        startX: Math.min(startPos.x, currentPos.x),
        startY: Math.min(startPos.y, currentPos.y),
        endX: Math.max(startPos.x, currentPos.x),
        endY: Math.max(startPos.y, currentPos.y),
      };
    }
  }
}

export function updatePencil(
  currentPos: { x: number; y: number },
  lastShape: ShapeType,
): ShapeType {
  if (!lastShape) return lastShape;
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

export function finishPencil(shape: ShapeType) {
  if (!shape || !Array.isArray(shape.points) || shape.type !== "PENCIL")
    return shape;

  // 1. FIND THE TRUE BOUNDS from the points array
  // We cannot trust shape.startX/endX because the user might have scribbled outside that line.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shape.points!.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  const width = maxX - minX;
  const height = maxY - minY;

  const safeW = width === 0 ? 1 : width;
  const safeH = height === 0 ? 1 : height;

  // 2. Normalize based on the TRUE bounds
  const normalizedPoints = shape.points!.map((p) => ({
    x: (p.x - minX) / safeW, // This will guaranteed be 0.0 to 1.0
    y: (p.y - minY) / safeH,
  }));

  // 3. Update the shape with the NEW bounds and normalized points
  return {
    ...shape,
    points: normalizedPoints,
    isNormalized: true,
  };
}
