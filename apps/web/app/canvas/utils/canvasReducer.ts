import { Action, State } from "../types/index";
export default function canvasReducer(state: State, action: Action): State {
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
    default:
      return state;
  }
}
