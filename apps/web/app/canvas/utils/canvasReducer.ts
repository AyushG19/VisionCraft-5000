import { Action, CanvasState } from "../types/index";

export const initialCanvasState: CanvasState = {
  drawnShapes: [],
  history: [[]],
  historyIndex: 0,
  toolState: {
    currentTool: "select",
    currentColor: { l: 0.7, c: 0.1, h: 0 },
    strokeSize: 2,
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

  // if (action.type === "FINISH_SHAPE") {
  //   const shapeIndex = state.drawnShapes.length - 1;
  //   const shape = state.drawnShapes[shapeIndex];
  //   if (!shape || !Array.isArray(shape.points) || shape.type !== "PENCIL")
  //     return state;

  //   const updatedShape = createNormalizedShape(shape);

  //   const newDrawnShapes = [...state.drawnShapes];
  //   newDrawnShapes[shapeIndex] = updatedShape;

  //   return {
  //     ...state,
  //     drawnShapes: newDrawnShapes,
  //   };
  // }
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
  return state;
}
