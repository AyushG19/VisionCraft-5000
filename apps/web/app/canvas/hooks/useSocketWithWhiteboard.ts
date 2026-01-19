import React, { useReducer, useRef, useState } from "react";
import useCanvasInteraction from "./useCanvasInteraction";
import canvasReducer from "../utils/canvasReducer";
import { Action, CanvasState, Message } from "../types";
import { ShapeType } from "@repo/common/types";
import { useCanvasSocket } from "./useCanvasSocket";
import { ToolState } from "@repo/common/toolState";

type EventType = {
  type: "ADD" | "DEL" | "UPD";
  shape: ShapeType;
};
export const useSocketWithWhiteboard = (
  enabled: boolean,
  roomId: string,
  slug: string
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
    undefined
  );
  const [messages, setMessages] = useState<Message[] | []>([]);
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
  const onMessage = (event: any) => {
    handleMessage(JSON.parse(event.data));
  };
  const { send } = useCanvasSocket(enabled, onMessage, roomId, slug);

  const dispatchWithSocket = (action: Action) => {
    canvasDispatch(action);
    if (!send) return;
    if (action.type === "ADD_SHAPE") {
      let messagePayload: EventType = {
        type: "ADD",
        shape: action.payload,
      };
      send({ type: "ADD_SHAPE", payload: messagePayload });
    }
    if (action.type === "DEL_SHAPE") {
      let messagePayload = {
        type: "DEL",
        shape: action.payload,
      };
      send({ type: "DEL_SHAPE", payload: messagePayload });
    }
  };

  //attaching listerners
  useCanvasInteraction(
    canvasRef,
    canvasState,
    selectedShape,
    setSelectedShape,
    canvasDispatch,
    dispatchWithSocket
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
