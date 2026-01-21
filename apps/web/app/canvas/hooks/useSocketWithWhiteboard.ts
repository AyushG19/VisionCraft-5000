"use client";
import React, { useReducer, useRef, useState } from "react";
import useCanvasInteraction from "./useCanvasInteraction";
import canvasReducer from "../utils/canvasReducer";
import { Action, CanvasState, MessageReceivedType } from "../types";
import {
  MessageType,
  ShapeType,
  WebSocketData,
  WebSocketDataType,
} from "@repo/common/types";
import { useCanvasSocket } from "./useCanvasSocket";
import { ToolState } from "@repo/common/toolState";

type EventType = {
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
export const useSocketWithWhiteboard = (
  enabled: boolean,
  roomId: string,
  slug: string,
  token: string,
) => {
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
  const [canvasState, canvasDispatch] = useReducer(canvasReducer, initState);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeType | undefined>(
    undefined,
  );
  const [messages, setMessages] = useState<MessageReceivedType[] | []>([]);
  const handleMessage = (event: WebSocketDataType) => {
    switch (event.type) {
      case "ADD_SHAPE": {
        const shape = event.payload.shape;
        if (shape) {
          canvasDispatch({ type: "ADD_SHAPE", payload: shape });
        }
        break;
      }
      case "UPD_SHAPE": {
        const shape = event.payload.shape;
        if (shape) {
          canvasDispatch({ type: "UPD_SHAPE", payload: shape });
        }
        break;
      }
      case "DEL_SHAPE": {
        const shape = event.payload.shape;
        if (shape) {
          canvasDispatch({ type: "DEL_SHAPE", payload: shape });
        }
        break;
      }
      case "CHAT": {
        const message = event.payload.message;
        if (message?.status === "TO_FRONTEND") {
          setMessages((prev) => [...prev, message]);
        }
        break;
      }
    }
  };
  const onMessage = (event: any) => {
    handleMessage(JSON.parse(event.data));
  };
  const { send } = useCanvasSocket(enabled, onMessage, roomId, slug, token);

  const dispatchWithSocket = (action: Action) => {
    canvasDispatch(action);
    if (!send) return;
    if (action.type === "ADD_SHAPE") {
      console.log(action.payload);
      send("ADD_SHAPE", { shape: action.payload });
    }
    if (action.type === "UPD_SHAPE") {
      send("UPD_SHAPE", { shape: action.payload });
    }
    if (action.type === "DEL_SHAPE") {
      send("DEL_SHAPE", { shape: action.payload });
    }
  };

  //attaching listerners
  useCanvasInteraction(
    canvasRef,
    canvasState,
    selectedShape,
    setSelectedShape,
    canvasDispatch,
    dispatchWithSocket,
  );
  const handleToolSelect = (toolName: ToolState["currentTool"]) => {
    console.log(toolName);
    if (!canvasRef.current) return;
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
    messages,
    setMessages,
    send,
  };
};
