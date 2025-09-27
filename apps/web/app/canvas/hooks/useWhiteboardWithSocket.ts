"use client";
import { ToolState } from "@repo/common/toolState";
import React, { useRef, useEffect, useReducer, useState } from "react";
import oklchToCSS from "../utils/oklchToCss";
import { Action, Message, CanvasState, DragStateType } from "../types/index";
import { type ShapeType } from "@repo/common/types";
import debounce from "../utils/debounce";
import { saveCanvasState } from "../api";
import { WS_BE_URL } from "config";
import canvasReducer from "../utils/canvasReducer";
import isClickOnShape from "../utils/isPointInShape";
import redrawPreviousShapes from "../utils/redrawPreviousShapes";
import resizeCanvas from "../utils/canvasResizeHelper";
import pencilIcon from "../utils/pencilIcon";
import createNewShape from "../utils/createNewShape";
type EventType = {
  userId: string;
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};

export const useWhiteboardWithSocket = (enabled: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const crosshairTools = ["SQUARE", "CIRCLE", "ARROW", "TRIANGLE"];

  const initState: CanvasState = {
    startPos: { x: 0, y: 0 },
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

  const [canvasState, canvasDispatch] = useReducer(canvasReducer, initState);
  const dragState = useRef<DragStateType>({
    isDragging: false,
    draggedShapeId: null,
    offsetX: 0,
    offsetY: 0,
  });
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
    if (crosshairTools.includes(canvasState.toolState.currentTool)) {
      canvas.style.cursor = "crosshair";
    } else if (canvasState.toolState.currentTool === "PENCIL") {
      canvas.style.cursor = `url(${pencilIcon}) 3 16 ,auto`;
    }

    resizeCanvas(
      canvas,
      ctx,
      () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
      canvasState.toolState
    );
    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => redrawPreviousShapes(ctx, canvasState.drawnShapes),
        canvasState.toolState
      );
    };

    ctx.strokeStyle = oklchToCSS(canvasState.toolState.currentColor);

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      const currPos = getMousePos(e);
      if (canvasState.toolState.currentTool === "SELECT") {
        const clickedShape = canvasState.drawnShapes.find((shape: ShapeType) =>
          isClickOnShape(getMousePos(e), shape)
        );
        if (!clickedShape) return;
        dragState.current = {
          isDragging: true,
          draggedShapeId: clickedShape.id,
          offsetX: currPos.x - clickedShape.startX,
          offsetY: currPos.y - clickedShape.startY,
        };
        return;
      }
      isDrawing.current = true;
      canvasState.startPos = currPos;
      if (canvasState.toolState.currentTool === "PENCIL") {
        canvasDispatch({
          type: "ADD_SHAPE",
          payload: createNewShape(canvasState, { x: 0, y: 0 }),
        });
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      if (canvasState.toolState.currentTool === "SELECT") {
        let clickedShape;
        if (!dragState.current.isDragging) {
          clickedShape = canvasState.drawnShapes.find((shape: ShapeType) =>
            isClickOnShape(getMousePos(e), shape)
          );
          canvasRef.current.style.cursor = clickedShape ? "move" : "default";
        }
        const currPos = getMousePos(e);
        if (!dragState.current.draggedShapeId || !dragState.current.isDragging)
          return;
        canvasDispatch({
          type: "MOVE",
          payload: {
            clickedShapeId: dragState.current.draggedShapeId,
            newStartX: currPos.x - dragState.current.offsetX,
            newStartY: currPos.y - dragState.current.offsetY,
          },
        });
        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          createNewShape(canvasState, currPos)
        );

        return;
      }
      if (!isDrawing.current) return;

      const currentPos = getMousePos(e);
      console.log(canvasState.toolState.currentTool);

      if (canvasState.toolState.currentTool !== "PENCIL") {
        redrawPreviousShapes(
          ctx,
          canvasState.drawnShapes,
          createNewShape(canvasState, currentPos)
        );
      } else {
        canvasDispatch({ type: "UPDATE_PENCIL", payload: currentPos });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      console.log(canvasState.toolState.currentTool);
      if (canvasState.toolState.currentTool === "SELECT") {
        dragState.current.isDragging = false;
        return;
      }
      if (!isDrawing.current) return;
      const currentPos = getMousePos(e);

      console.log("adding a shape");
      dispatchWithSocket({
        type: "ADD_SHAPE",
        payload: createNewShape(canvasState, currentPos),
      });
      isDrawing.current = false;
      canvasState.toolState.currentTool = "SELECT";
    };

    redrawPreviousShapes(ctx, canvasState.drawnShapes);
    console.log(canvasState.drawnShapes);

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
  }, [canvasState.toolState, canvasState]);

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
    canvasState,
    wsRef,
    isDrawing,
    messages,
  };
};
