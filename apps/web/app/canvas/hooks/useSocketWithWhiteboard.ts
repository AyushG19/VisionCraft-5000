/**
 * useSocketWithWhiteboard - NO PAN/ZOOM VERSION
 *
 * Top-level hook without pan/zoom functionality.
 */

"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import useCanvasInteraction from "./useCanvasInteraction";
import canvasReducer from "../utils/canvasReducer";
import {
  Action,
  CanvasState,
  MessageReceivedType,
  SendPropsType,
  TextEditState,
} from "../types";
import { AllToolTypes, DrawElement, WebSocketDataType } from "@repo/common";
import { useCanvasSocket } from "./useCanvasSocket";
import { createNewText } from "../utils/createNewShape";
import { text } from "stream/consumers";

export const useSocketWithWhiteboard = (
  roomId: string,
  slug: string,
  token: string,
  isOpen: boolean,
): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasState: CanvasState;
  selectedShape: DrawElement | undefined;
  setSelectedShape: (shape: DrawElement | undefined) => void;
  canvasDispatch: React.Dispatch<Action>;
  dispatchWithSocket: (action: Action) => void;
  handleToolSelect: (toolName: AllToolTypes) => void;
  handleColorSelect: (color: { l: number; c: number; h: number }) => void;
  handleStrokeSelect: (size: number) => void;
  handleRedo: () => void;
  handleUndo: () => void;
  messages: MessageReceivedType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageReceivedType[]>>;
  send: (
    type: SendPropsType["type"],
    payload: SendPropsType["payload"],
  ) => void;
  textEdit: TextEditState;
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>;
  finalizeText: () => void;
  finishText: () => void;
  cancelText: () => void;
} => {
  const initState: CanvasState = {
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

  const [canvasState, canvasDispatch] = useReducer(canvasReducer, initState);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [messages, setMessages] = useState<MessageReceivedType[]>([]);
  const [textEdit, setTextEdit] = useState<TextEditState>(null);

  const handleOutgoingEvent = (event: WebSocketDataType) => {
    switch (event.type) {
      case "ADD_SHAPE": {
        const shape = event.payload;
        if (shape) {
          canvasDispatch({ type: "ADD_SHAPE", payload: shape });
        }
        break;
      }

      case "UPD_SHAPE": {
        const shape = event.payload;
        if (shape) {
          canvasDispatch({ type: "UPD_SHAPE", payload: shape });
        }
        break;
      }

      case "DEL_SHAPE": {
        const shape = event.payload;
        if (shape) {
          canvasDispatch({ type: "DEL_SHAPE", payload: shape });
        }
        break;
      }

      case "CHAT": {
        const message = event.payload;
        if (message?.status === "TO_FRONTEND") {
          setMessages((prev) => [...prev, message]);
        }
        break;
      }
    }
  };

  const onMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      handleOutgoingEvent(data);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  const { send } = useCanvasSocket(onMessage, roomId, slug, token);

  const dispatchWithSocket = (action: Action) => {
    canvasDispatch(action);

    if (!send) return;

    switch (action.type) {
      case "ADD_SHAPE":
        send("ADD_SHAPE", action.payload);
        break;

      case "UPD_SHAPE":
        send("UPD_SHAPE", action.payload);
        break;

      case "DEL_SHAPE":
        send("DEL_SHAPE", action.payload);
        break;
    }
  };

  const { selectedShape, setSelectedShape } = useCanvasInteraction(
    canvasRef,
    canvasState,
    canvasDispatch,
    dispatchWithSocket,
    isOpen,
    setTextEdit,
  );
  useEffect(() => {
    console.log(textEdit);
  }, [textEdit]);
  const handleToolSelect = (toolName: AllToolTypes) => {
    canvasDispatch({ type: "CHANGE_TOOL", payload: toolName });

    if (toolName !== "select" && selectedShape) {
      setSelectedShape(undefined);
    }
  };

  const measureText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSize: number,
    fontFamily: string,
  ): { width: number; height: number } => {
    const lines = text.split("\n");

    let maxWidth = 0;
    ctx.font = `${fontSize}px ${fontFamily}`;
    for (const line of lines) {
      maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
    }

    const lineHeight = fontSize * 1.2; // Excalidraw-style
    const height = lines.length * lineHeight;
    return { width: maxWidth, height: height };
  };

  const finalizeText = () => {
    if (!textEdit || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { width, height } = measureText(
      ctx,
      textEdit.text,
      canvasState.textState.fontSize,
      canvasState.textState.fontFamily,
    );
    const element = createNewText(
      canvasState.toolState,
      canvasState.textState,
      { x: textEdit.x, y: textEdit.y },
      textEdit.text,
      width,
      height,
    );
    console.log("text: ", textEdit.text);
    canvasDispatch({ type: "ADD_SHAPE", payload: element });
    setTextEdit(null);
  };

  const finishText = () => {
    finalizeText();
  };

  const cancelText = () => {
    setTextEdit(null);
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
    canvasState,
    selectedShape,
    setSelectedShape,
    canvasDispatch,
    dispatchWithSocket,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    messages,
    setMessages,
    send,
    textEdit,
    setTextEdit,
    finalizeText,
    finishText,
    cancelText,
  };
};
