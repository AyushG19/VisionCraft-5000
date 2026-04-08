"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import useCanvasInteraction from "./useCanvasInteraction";
import canvasReducer, { initialCanvasState } from "../utils/canvasReducer";
import { Action, CanvasState, SendPropsType, TextEditState } from "../types";
import {
  AllToolTypes,
  DrawElement,
  PointType,
  ServerMessageType,
  ServerSocketDataType,
} from "@repo/common";
import { useCanvasSocket } from "./useCanvasSocket";
import { createNewText } from "../utils/createNewShape";
import { joinRoomService } from "app/services/canvas.service";
import { useSocketContext } from "@repo/hooks";
import { measureText } from "app/lib/canvas.helper";
import useMousePosition from "./useMousePosition";
import {
  generateUserObject,
  incomingSocketHandlers,
} from "app/lib/socket.helper";

export const useSocketWithWhiteboard = (): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
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
  messages: ServerMessageType[];
  setMessages: React.Dispatch<React.SetStateAction<ServerMessageType[]>>;
  send: (
    type: SendPropsType["type"],
    payload: SendPropsType["payload"],
  ) => void;
  textEdit: TextEditState;
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>;
  finalizeText: () => void;
  finishText: () => void;
  cancelText: () => void;
  inRoom: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLeaveRoom: () => void;
  handleJoinRoom: (code: string) => void;
  slug: string;
} => {
  const [canvasState, canvasDispatch] = useReducer(
    canvasReducer,
    initialCanvasState,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [messages, setMessages] = useState<ServerMessageType[]>([]);
  const [textEdit, setTextEdit] = useState<TextEditState>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    inRoom,
    setToken,
    isOpen,
    setIsOpen,
    setRoomInfo,
    roomInfo,
    memberCursor,
  } = useSocketContext();

  const { getScreenCoordinates } = useMousePosition(canvasRef);

  // const handleIncomingMessage = async (event: ServerSocketDataType) => {
  //   switch (event.type) {
  //     case "ADD_SHAPE": {
  //       const shape = event.payload;
  //       if (shape) {
  //         canvasDispatch({ type: "ADD_SHAPE", payload: shape });
  //       }
  //       break;
  //     }

  //     case "UPD_SHAPE": {
  //       const shape = event.payload;
  //       if (shape) {
  //         canvasDispatch({ type: "UPD_SHAPE", payload: shape });
  //       }
  //       break;
  //     }

  //     case "DEL_SHAPE": {
  //       const shape = event.payload;
  //       if (shape) {
  //         canvasDispatch({ type: "DEL_SHAPE", payload: shape });
  //       }
  //       break;
  //     }

  //     case "CHAT": {
  //       const message = event.payload;
  //       if (message?.status === "TO_FRONTEND") {
  //         setMessages((prev) => [...prev, message]);
  //       }
  //       break;
  //     }
  //     case "CURSOR": {
  //       const { userId, coordinates } = event.payload;
  //       memberCursor.current.set(userId, coordinates);
  //       break;
  //     }
  //     case "USER_LEFT": {
  //       const { userId } = event.payload;
  //       setRoomInfo({
  //         ...roomInfo,
  //         users: roomInfo.users.filter((u) => u.userId !== userId),
  //       });
  //       memberCursor.current.delete(userId);
  //     }
  //     case "USER_JOINED": {
  //       const { userId } = event.payload;
  //       const info = await getUserInfo(userId);
  //       setRoomInfo({
  //         ...roomInfo,
  //         users: [...roomInfo.users, generateUserObject(info)],
  //       });
  //     }
  //     default: {
  //       console.log("mess");
  //     }
  //   }
  // };

  const onMessage = (event: ServerSocketDataType) => {
    try {
      if (event.type !== "CURSOR") {
        console.log(event);
      }
      const handler = incomingSocketHandlers[event.type];
      handler({
        canvasDispatch,
        event,
        memberCursorMap: memberCursor.current,
        setMessages,
        setRoomInfo,
      });
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  const { send, connect, disconnect } = useCanvasSocket(onMessage);

  const sendCursorState = (pos: PointType) => {
    send("CURSOR", pos);
  };
  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoomService(code);
      const roomUsers = data.users.map((user) => generateUserObject(user));
      setRoomInfo({
        ...roomInfo,
        roomId: data.roomId,
        slug: code,
        users: roomUsers,
      });

      canvasDispatch({ type: "INITIALIZE_BOARD", payload: data.canvasState });

      setToken(data.token);
      connect(data.roomId, code, data.token);

      console.log("From page handleJoinRoom: ", data);
    } catch (error) {
      //@ts-ignore
      console.error("error in join room : ", error.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      disconnect();
      setRoomInfo({ ...roomInfo, roomId: "", slug: "" });
      setToken("");

      console.log("From page handleLeaveRoom: ");
    } catch (error) {
      console.error("error in join room");
    }
  };

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
    inputRef,
    canvasState,
    canvasDispatch,
    dispatchWithSocket,
    sendCursorState,
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
    dispatchWithSocket({ type: "ADD_SHAPE", payload: element });
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
    inputRef,
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
    inRoom,
    isOpen,
    setIsOpen,
    handleLeaveRoom,
    handleJoinRoom,
    slug: roomInfo.slug,
  };
};
