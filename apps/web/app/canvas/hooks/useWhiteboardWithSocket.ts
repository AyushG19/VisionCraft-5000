"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer } from "react";
import oklchToCSS from "../utils/oklchToCss";
import { Action, State } from "../types/index";
import { type ShapeType } from "@repo/common/types";
import { drawShape } from "../utils/drawing";
import debounce from "../utils/debounce";
import { saveCanvasState } from "../api";
import { useRoomID } from "./useRoomID";
import { WS_BE_URL } from "config";
type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
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

export const useWhiteboardWithSocket = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

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

  const dispatchWithSocket = (action: Action) => {
    dispatch(action);
    if (!wsRef.current) return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.log("no user Id");
      return;
    }
    if (action.type === "ADD_SHAPE") {
      let messagePayload: EventType = {
        userId: userId,
        type: "ADD",
        shape: action.payload,
      };
      wsRef.current.send(
        JSON.stringify({ type: "ADD_SHAPE", payload: messagePayload })
      );
    }
    if (action.type === "DEL_SHAPE") {
      let messagePayload = {
        userId: userId,
        type: "DEL",
        shape: action.payload,
      };
      wsRef.current.send(
        JSON.stringify({ type: "DEL_SHAPE", payload: messagePayload })
      );
    }
  };

  const handleMessage = (event: any) => {
    switch (event.type) {
      case "ADD":
        dispatch({ type: "ADD_SHAPE", payload: event.shape });
        break;
      case "DEL":
        dispatch({ type: "DEL_SHAPE", payload: event.shape });
        break;
    }
  };
  useEffect(() => {
    if (!enabled) return;
    console.log("in canvas socket");
    const token = localStorage.getItem("token");
    const roomId = localStorage.getItem("roomId");
    if (!token || !roomId) {
      alert("login with email to chat");
      return;
    }
    const ws = new WebSocket(
      `${WS_BE_URL}?token=${encodeURIComponent(token)}&roomId=${roomId}`
    );
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("opened connection");
      wsRef.current?.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            userId: "b357fe14-cf67-4c71-9a00-f6636e7a7018",
            shape: {
              id: "cdc51e8d-20dc-4a4c-8103-7547a1d09c5f",
              type: "square",
              lineWidth: 10,
              lineColor: {
                h: 0,
                c: 0.15,
                l: 0.7,
              },
              fillColor: {
                h: 0,
                c: 0.15,
                l: 0.7,
              },
              startX: 286,
              startY: 209,
              endX: 495,
              endY: 334,
            },
          },
        })
      );
    };
    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data));
      console.log("Event: ", event);
    };
    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = (ev) => {
      console.log("WS closed:", ev);
      wsRef.current?.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: {
            userId: "b357fe14-cf67-4c71-9a00-f6636e7a7018",
            shape: {
              id: "cdc51e8d-20dc-4a4c-8103-7547a1d09c5f",
              type: "square",
              lineWidth: 10,
              lineColor: {
                h: 0,
                c: 0.15,
                l: 0.7,
              },
              fillColor: {
                h: 0,
                c: 0.15,
                l: 0.7,
              },
              startX: 286,
              startY: 209,
              endX: 495,
              endY: 334,
            },
          },
        })
      );
    };

    return () => ws.close();
  }, [enabled]);

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
      dispatchWithSocket({ type: "ADD_SHAPE", payload: newShape });
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
  };

  const handleColorSelect = (color: { l: number; c: number; h: number }) => {
    dispatch({ type: "CHANGE_COLOR", payload: color });
  };
  const handleStrokeSelect = (size: number) => {
    dispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };
  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  return {
    canvasRef,
    dispatch,
    dispatchWithSocket,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    state,
    wsRef,
    isDrawing,
  };
};
