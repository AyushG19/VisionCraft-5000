"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer, useState } from "react";
import oklchToCSS from "../utils/oklchToCss";
import { Action, Message, State } from "../types/index";
import { type ShapeType } from "@repo/common/types";
import { drawShape } from "../utils/drawing";
import debounce from "../utils/debounce";
import { saveCanvasState } from "../api";
import { WS_BE_URL } from "config";
import canvasReducer from "../utils/canvasReducer";
import isClickOnShape from "../utils/isPointInShape";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import resizeCanvas from "../utils/canvasResizeHelper";
type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
const pencilIcon =
  "data:image/svg+xml,%3Csvg%20%20xmlns=%22http://www.w3.org/2000/svg%22%20%20width=%2220%22%20%20height=%2220%22%20%20viewBox=%220%200%2024%2024%22%20%20fill=%22none%22%20%20stroke=%22white%22%20%20stroke-width=%222%22%20%20stroke-linecap=%22round%22%20%20stroke-linejoin=%22round%22%20%20class=%22icon%20icon-tabler%20icons-tabler-outline%20icon-tabler-pencil%22%3E%3Cpath%20stroke=%22none%22%20d=%22M0%200h24v24H0z%22%20fill=%22none%22/%3E%3Cpath%20d=%22M4%2020h4l10.5%20-10.5a2.828%202.828%200%201%200%20-4%20-4l-10.5%2010.5v4%22%20/%3E%3Cpath%20d=%22M13.5%206.5l4%204%22%20/%3E%3C/svg%3E";

export const useWhiteboardWithSocket = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const crosshairTools = ["SQUARE", "CIRCLE", "ARROW", "TRIANGLE"];

  const initState: State = {
    drawnShapes: [],
    history: [[]],
    historyIndex: 0,
    toolState: {
      currentTool: "SELECT",
      currentColor: { l: 0.7, c: 0.1, h: 0 },
      brushSize: 2,
    },
  };
  const [messages, setMessages] = useState<Message[] | []>([]);

  const [state, canvasDispatch] = useReducer(canvasReducer, initState);
  const debounceCanvasSave = useRef(debounce(saveCanvasState, 10000));

  const dispatchWithSocket = (action: Action) => {
    canvasDispatch(action);
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
        canvasDispatch({ type: "ADD_SHAPE", payload: event.shape });
        break;
      case "DEL":
        canvasDispatch({ type: "DEL_SHAPE", payload: event.shape });
        break;
      case "CHAT":
        setMessages((prev) => [...prev, event.message]);
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
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const ws = new WebSocket(
      `${WS_BE_URL}?token=${encodeURIComponent(token)}&roomId=${roomId}`
    );
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("opened connection");
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { userId: userId },
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
      ws.send(
        JSON.stringify({
          type: "LEAVE_ROOM",
          payload: { userId: userId },
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
    if (crosshairTools.includes(state.toolState.currentTool)) {
      canvas.style.cursor = "crosshair";
    } else if (state.toolState.currentTool === "PENCIL") {
      canvas.style.cursor = `url(${pencilIcon}) 3 20 ,auto`;
    }

    resizeCanvas(
      canvas,
      ctx,
      () => redrawPreviousShapes(ctx, state.drawnShapes),
      state.toolState
    );
    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => redrawPreviousShapes(ctx, state.drawnShapes),
        state.toolState
      );
    };

    ctx.strokeStyle = oklchToCSS(state.toolState.currentColor);

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (state.toolState.currentTool === "SELECT") return;
      isDrawing.current = true;
      startPos.current = getMousePos(e);
      if (state.toolState.currentTool === "PENCIL") {
        let newShape = {
          id: crypto.randomUUID(),
          type: state.toolState.currentTool,
          lineWidth: state.toolState.brushSize,
          lineColor: state.toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: startPos.current.x,
          endY: startPos.current.y,
          points: [startPos.current],
        };
        canvasDispatch({ type: "ADD_SHAPE", payload: newShape });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      if (state.toolState.currentTool === "SELECT") {
        const clickedShape = state.drawnShapes.find((shape) =>
          isClickOnShape(getMousePos(e), shape)
        );

        canvasRef.current.style.cursor = clickedShape ? "move" : "default";
        return;
      }
      if (!isDrawing.current) return;

      const currentPos = getMousePos(e);
      console.log(state.toolState.currentTool);

      if (state.toolState.currentTool !== "PENCIL") {
        redrawPreviousShapes(ctx, state.drawnShapes, {
          id: crypto.randomUUID(),
          type: state.toolState.currentTool,
          lineWidth: state.toolState.brushSize,
          lineColor: state.toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: currentPos.x,
          endY: currentPos.y,
        });
      } else {
        canvasDispatch({ type: "UPDATE_PENCIL", payload: currentPos });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      if (state.toolState.currentTool === "SELECT") {
        isDrawing.current = false;
        return;
      }
      const currentPos = getMousePos(e);

      const newShape = {
        id: crypto.randomUUID(),
        type: state.toolState.currentTool,
        lineWidth: state.toolState.brushSize,
        lineColor: state.toolState.currentColor,
        startX: startPos.current.x,
        startY: startPos.current.y,
        endX: currentPos.x,
        endY: currentPos.y,
      };
      console.log("adding a shape");
      dispatchWithSocket({ type: "ADD_SHAPE", payload: newShape });
      isDrawing.current = false;
      state.toolState.currentTool = "SELECT";
    };

    redrawPreviousShapes(ctx, state.drawnShapes);
    console.log(state.drawnShapes);

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [state.toolState, state]);

  const handleToolSelect = (toolName: ToolState["currentTool"]) => {
    console.log(toolName);
    canvasDispatch({ type: "CHANGE_TOOL", payload: toolName });
  };

  const handleColorSelect = (color: { l: number; c: number; h: number }) => {
    canvasDispatch({ type: "CHANGE_COLOR", payload: color });
  };
  const handleStrokeSelect = (size: number) => {
    canvasDispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleRedo = () => {
    canvasDispatch({ type: "REDO" });
  };
  const handleUndo = () => {
    canvasDispatch({ type: "UNDO" });
  };

  return {
    canvasRef,
    canvasDispatch,
    dispatchWithSocket,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    state,
    wsRef,
    isDrawing,
    messages,
  };
};
