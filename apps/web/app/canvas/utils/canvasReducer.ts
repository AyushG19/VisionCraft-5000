import { Action, CanvasState } from "../types/index";

export const initialCanvasState: CanvasState = {
  drawnShapes: [],
  history: [[]],
  historyIndex: 0,
  toolState: {
    currentTool: "select",
    currentColor: { l: 84.586, c: 0.08089, h: 247.192 },
    strokeSize: 2,
  },
  sideToolKitState: {
    strokeColor: "oklch(0.6232 0.1502 284.72)",
    fillColor: "oklch(0.6232 0.1502 284.72)",
    strokeWidth: 2,
    roundness: 0,
    opacity: 100,
    strokeType: "normal",
  },
  textState: {
    fontFamily: "google sans code",
    alignment: "left",
    fontSize: 20,
  },
};

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

    const newCanvasState = [...state.drawnShapes, action.payload];
    return {
      ...state,
      drawnShapes: newCanvasState,
      history: [...previousHistory, newCanvasState],
      historyIndex: previousHistory.length,
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
      toolState: { ...state.toolState, strokeSize: action.payload },
    };
  }
  if (action.type === "UPD_SHAPE") {
    return {
      ...state,
      drawnShapes: state.drawnShapes.map((s) => {
        if (s.id === action.payload.id)
          return {
            ...action.payload,
            id: s.id,
          };
        return s;
      }),
    };
  }
  if (action.type === "UPD_EDITOR") {
    return {
      ...state,
      sideToolKitState: {
        ...state.sideToolKitState,
        ...action.payload,
      },
    };
  }
  if (action.type === "UPD_TEXT_STATE") {
    return {
      ...state,
      textState: {
        ...state.textState,
        ...action.payload,
      },
    };
  }
  return state;
}
