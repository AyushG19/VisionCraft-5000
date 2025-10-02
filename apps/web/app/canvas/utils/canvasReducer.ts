import { ShapeType } from "@repo/common/types";
import { Action, CanvasState } from "../types/index";
export default function canvasReducer(
  state: CanvasState,
  action: Action
): CanvasState {
  switch (action.type) {
    case "INITIALIZE_BOARD":
      return {
        ...state,
        drawnShapes: action.payload,
      };
    case "DEL_SHAPE":
      return {
        ...state,
        drawnShapes: state.drawnShapes.filter(
          (shape) => shape.id !== action.payload.id
        ),
      };
    case "ADD_SHAPE":
      const previousHistory = state.history.slice(0, state.historyIndex + 1);
      const newCanvasState = [...state.drawnShapes, action.payload];

      return {
        ...state,
        drawnShapes: newCanvasState,
        history: [...previousHistory, newCanvasState],
        historyIndex: previousHistory.length,
      };
    case "UPDATE_PENCIL":
      const currentPos = action.payload;
      const lastShapeIndex = state.drawnShapes.length - 1;
      const lastShape = state.drawnShapes[lastShapeIndex];
      if (!lastShape) return state;
      const updatedPoints = [...(lastShape.points || []), currentPos];
      return {
        ...state,
        drawnShapes: [
          ...state.drawnShapes.slice(0, lastShapeIndex),
          {
            ...lastShape,
            points: updatedPoints,
            endX: currentPos.x,
            endY: currentPos.y,
          },
        ],
      };

    case "REDO":
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
    case "UNDO":
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
    case "CHANGE_TOOL":
      return {
        ...state,
        toolState: { ...state.toolState, currentTool: action.payload },
      };
    case "CHANGE_COLOR":
      return {
        ...state,
        toolState: { ...state.toolState, currentColor: action.payload },
      };
    case "CHANGE_BRUSHSIZE":
      return {
        ...state,
        toolState: { ...state.toolState, brushSize: action.payload },
      };
    case "UPDATE": {
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

    default:
      return state;
  }
}
