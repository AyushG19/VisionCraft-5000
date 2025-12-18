"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer } from "react";
import oklchToCSS from "../utils/oklchToCss";
import { Action, State } from "../types/index";
import { type ShapeType } from "@repo/common/types";
import { drawShape } from "../utils/drawing";
import debounce from "../utils/debounce";
import { saveCanvasState } from "../../api";
import { useRoomID } from "./useRoomID";
// const oklchToCSS = ({
//   l,
//   c,
//   h,
// }: {
//   l: number;
//   c: number;
//   h: number;
// }): string => {
//   return `oklch(${l} ${c} ${h})`;
// };

function reducer(state: State, action: Action): State {
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
    // case "FINISH_SHAPE":
    //   const previousHistory = state.history.slice(0, state.historyIndex + 1);
    //   const newCanvasState = [...state.drawnShapes, action.payload];

    //   return {
    //     ...state,
    //     drawnShapes: newCanvasState,
    //     history: [...previousHistory, newCanvasState],
    //     historyIndex: previousHistory.length,
    //   };
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

export const useWhiteBoard = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  // const [toolState, setToolState] = useState<ToolState>({
  //   currentTool: "none",
  //   currentColor: { l: 0.7, c: 0.1, h: 0 },
  //   brushSize: 10,
  // });

  const initState: State = {
    drawnShapes: [],
    history: [[]],
    historyIndex: 0,
    toolState: {
      currentTool: "none",
      currentColor: { l: 0.7, c: 0.1, h: 0 },
      brushSize: 10,
    },
  };

  const [state, dispatch] = useReducer(reducer, initState);
  const debounceCanvasSave = useRef(debounce(saveCanvasState, 10000));

  //   const drawShape = useCallback(
  //     (ctx: CanvasRenderingContext2D, shape: Shape) => {
  //       const width = shape.endX - shape.startX;
  //       const height = shape.endY - shape.startY;
  //       ctx.beginPath();
  //       ctx.strokeStyle = oklchToCSS(shape.lineColor);
  //       switch (shape.type) {
  //         case "pencil":
  //           if (shape.points && shape.points.length > 1) {
  //             ctx.beginPath();
  //             ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
  //             for (let i = 1; i < shape.points.length; i++) {
  //               ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
  //             }
  //             ctx.stroke();
  //           }
  //           break;
  //         case "arrow":
  //           const angle = Math.atan2(height, width);
  //           ctx.beginPath();
  //           ctx.moveTo(shape.startX, shape.startY);
  //           ctx.lineTo(shape.endX, shape.endY);
  //           ctx.stroke();

  //           //Draw the arrowhead
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX, shape.endY);
  //           ctx.lineTo(
  //             shape.endX - 15 * Math.cos(angle - Math.PI / 7),
  //             shape.endY - 15 * Math.sin(angle - Math.PI / 7)
  //           );
  //           ctx.stroke();
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX, shape.endY);
  //           ctx.lineTo(
  //             shape.endX - 15 * Math.cos(angle + Math.PI / 7),
  //             shape.endY - 15 * Math.sin(angle + Math.PI / 7)
  //           );
  //           ctx.stroke();
  //           break;
  //         case "circle":
  //           const centerX = shape.startX + width / 2;
  //           const centerY = shape.startY + height / 2;
  //           const radiusX = Math.abs(width / 2);
  //           const radiusY = Math.abs(height / 2);
  //           ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  //           ctx.stroke();
  //           break;
  //         case "square":
  //           ctx.strokeRect(shape.startX, shape.startY, width, height);
  //           break;
  //         case "triangle":
  //           ctx.beginPath();
  //           ctx.moveTo(shape.endX - width / 2, shape.startY);
  //           ctx.lineTo(shape.endX - width, shape.startY + height);
  //           ctx.lineTo(shape.endX, shape.endY);
  //           ctx.closePath();
  //           ctx.stroke();
  //           break;
  //         case "redo":
  //         case "undo":
  //       }
  //     },
  //     [toolState]
  //   );

  // useEffect(() => {
  //   if (enabled && state.drawnShapes.length > 0) {
  //     const roomID = useRoomID();
  //     debounceCanvasSave.current(state.drawnShapes, roomID);
  //   }
  // }, [state.drawnShapes, enabled]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.lineWidth = 2;
    ctx.strokeStyle = oklchToCSS(state.toolState.currentColor);

    const getMousePos = (e: MouseEvent) => {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!startPos.current) return;

      isDrawing.current = true;
      startPos.current = getMousePos(e);
      if (state.toolState.currentTool === "pencil") {
        let newShape = {
          id: crypto.randomUUID(),
          type: state.toolState.currentTool,
          lineWidth: state.toolState.brushSize,
          lineColor: state.toolState.currentColor,
          fillColor: state.toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: startPos.current.x,
          endY: startPos.current.y,
          points: [startPos.current],
        };
        dispatch({ type: "ADD_SHAPE", payload: newShape });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !startPos.current) return;

      const currentPos = getMousePos(e);
      console.log(state.toolState.currentTool);

      if (state.toolState.currentTool !== "pencil") {
        redrawPreviousShapes({
          id: crypto.randomUUID(),
          type: state.toolState.currentTool,
          lineWidth: state.toolState.brushSize,
          lineColor: state.toolState.currentColor,
          fillColor: state.toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: currentPos.x,
          endY: currentPos.y,
        });
      } else {
        dispatch({ type: "UPDATE_PENCIL", payload: currentPos });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!startPos.current) return;
      if (
        state.toolState.currentTool === "none" ||
        state.toolState.currentTool === "select"
      )
        return;
      const newShape = {
        id: crypto.randomUUID(),
        type: state.toolState.currentTool,
        lineWidth: state.toolState.brushSize,
        lineColor: state.toolState.currentColor,
        fillColor: state.toolState.currentColor,
        startX: startPos.current.x,
        startY: startPos.current.y,
        endX: e.clientX,
        endY: e.clientY,
      };
      dispatch({ type: "ADD_SHAPE", payload: newShape });
      isDrawing.current = false;
    };
    const redrawPreviousShapes = (currentShape?: ShapeType) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      state.drawnShapes.forEach((shape) => drawShape(ctx, shape));
      if (currentShape) {
        drawShape(ctx, currentShape);
      }
    };
    redrawPreviousShapes();
    console.log(state.drawnShapes);

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [state.toolState, state]);

  const handleToolSelect = (toolName: ToolState["currentTool"]) => {
    console.log(toolName);
    dispatch({ type: "CHANGE_TOOL", payload: toolName });
    // setToolState((prev) => ({ ...prev, currentTool: toolName }));
    // console.log(state.toolState);
  };

  const handleColorSelect = (color: { l: number; c: number; h: number }) => {
    dispatch({ type: "CHANGE_COLOR", payload: color });
  };
  const handleStrokeSelect = (size: number) => {
    dispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
    // if (state.historyIndex < state.history.length - 1) {
    //   const newIndex = state.historyIndex + 1;
    //   const newState = state.history[newIndex];
    //   setDrawnShapes(newState || []);
    //   setHistoryIndex(newIndex);
    // }
  };
  const handleUndo = () => {
    dispatch({ type: "UNDO" });
    // if (historyIndex > 0) {
    //   const newIndex = historyIndex - 1;
    //   const newState = history[newIndex];
    //   setDrawnShapes(newState || []);
    //   setHistoryIndex(newIndex);
    // }
  };

  return {
    canvasRef,
    dispatch,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    state,
    isDrawing,
  };
};
