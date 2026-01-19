import { ShapeSchema, ShapeType } from "@repo/common/types";
import { Action, CanvasState } from "../types/index";
import { act } from "react";
export default function canvasReducer(
  state: CanvasState,
  action: Action,
): CanvasState {
  if (action.type === "INITIALIZE_BOARD") {
    return {
      ...state,
      drawnShapes: action.payload,
    };
  }
  if (action.type === "DEL_SHAPE") {
    return {
      ...state,
      drawnShapes: state.drawnShapes.filter(
        (shape) => shape.id !== action.payload.id,
      ),
    };
  }
  if (action.type === "ADD_SHAPE") {
    const previousHistory = state.history.slice(0, state.historyIndex + 1);
    // let newDrawnShape;
    // if (action.payload && action.payload.type === "PENCIL") {
    //   const currentPos = {
    //     x: action.payload.startX,
    //     y: action.payload.startY,
    //   };
    //   const normalizedPos = {
    //     x:
    //       (currentPos.x - action.payload.startX) /
    //       (action.payload.startX - action.payload.endX),
    //     y:
    //       (currentPos.y - action.payload.startY) /
    //       (action.payload.startY - action.payload.endY),
    //   };
    //   newDrawnShape = { ...action.payload, points: [normalizedPos] };
    // } else {
    //   newDrawnShape = action.payload;
    // }
    const newCanvasState = [...state.drawnShapes, action.payload];
    return {
      ...state,
      drawnShapes: newCanvasState,
      history: [...previousHistory, newCanvasState],
      historyIndex: previousHistory.length,
    };
  }
  if (action.type === "UPDATE_PENCIL") {
    const currentPos = action.payload;
    const lastShapeIndex = state.drawnShapes.length - 1;
    const lastShape = state.drawnShapes[lastShapeIndex];
    if (!lastShape) return state;
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
        return state;
      }
    }

    const updatedPoints = [...(lastShape.points || []), currentPos];
    return {
      ...state,
      drawnShapes: [
        ...state.drawnShapes.slice(0, lastShapeIndex),
        {
          ...lastShape,
          points: updatedPoints,
          startX: Math.min(currentPos.x, lastShape.startX),
          startY: Math.min(currentPos.y, lastShape.startY),
          endX: Math.max(currentPos.x, lastShape.endX),
          endY: Math.max(currentPos.y, lastShape.endY),
        },
      ],
    };
  }
  if (action.type === "FINISH_SHAPE") {
    const shapeIndex = state.drawnShapes.length - 1;
    const shape = state.drawnShapes[shapeIndex];

    if (!shape || !Array.isArray(shape.points) || shape.type !== "PENCIL")
      return state;

    // 1. FIND THE TRUE BOUNDS from the points array
    // We cannot trust shape.startX/endX because the user might have scribbled outside that line.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    shape.points.forEach((p) => {
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
    const normalizedPoints = shape.points.map((p) => ({
      x: (p.x - minX) / safeW, // This will guaranteed be 0.0 to 1.0
      y: (p.y - minY) / safeH,
    }));

    // 3. Update the shape with the NEW bounds and normalized points
    const updatedShape = {
      ...shape,
      points: normalizedPoints,
      isNormalized: true,
    };

    const newDrawnShapes = [...state.drawnShapes];
    newDrawnShapes[shapeIndex] = updatedShape;

    return {
      ...state,
      drawnShapes: newDrawnShapes,
    };
  }
  if (action.type === "REDO") {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const newState = state.history[newIndex];
      return {
        ...state,
        drawnShapes: newState || [],
        historyIndex: newIndex,
      };
    }
    return state;
  }
  if (action.type === "UNDO") {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const newState = state.history[newIndex];
      return {
        ...state,
        drawnShapes: newState || [],
        historyIndex: newIndex,
      };
    }
    return state;
  }
  if (action.type === "CHANGE_TOOL") {
    return {
      ...state,
      toolState: { ...state.toolState, currentTool: action.payload },
    };
  }
  if (action.type === "CHANGE_COLOR") {
    return {
      ...state,
      toolState: { ...state.toolState, currentColor: action.payload },
    };
  }
  if (action.type === "CHANGE_BRUSHSIZE") {
    return {
      ...state,
      toolState: { ...state.toolState, brushSize: action.payload },
    };
  }
  if (action.type === "UPDATE") {
    return {
      ...state,
      drawnShapes: state.drawnShapes.map((s) => {
        if (s.id === action.payload.shape.id)
          return {
            ...s,
            startX: action.payload.shape.startX,
            startY: action.payload.shape.startY,
            endX: action.payload.shape.endX,
            endY: action.payload.shape.endY,
          };
        return s;
      }),
    };
  }
  return state;
}
