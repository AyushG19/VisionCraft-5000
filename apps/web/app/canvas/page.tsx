"use client";
import React, { useContext, useEffect, useRef } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  Button,
} from "@repo/ui";
import { drawShape } from "./utils/drawing";
import { DrawElement } from "@repo/common";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import { createRoomService } from "app/services/canvas.service";
import oklchToCSS from "../lib/oklchToCss";
import useAi from "./hooks/useAi";
import { useError, useSocketContext } from "@repo/hooks";
import { ErrorModal } from "@workspace/ui/components/ErrorModal";
import UsersCursor from "@workspace/ui/components/ui/UsersCursor";
import useRafLoop from "./hooks/useRafLoop";

const page = () => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { roomInfo, memberCursor } = useSocketContext();

  useRafLoop({ cursorMap: memberCursor.current });

  const {
    canvasRef,
    canvasState,
    handleColorSelect,
    handleRedo,
    handleStrokeSelect,
    handleToolSelect,
    handleUndo,
    send,
    messages,
    setMessages,
    textEdit,
    setTextEdit,
    finishText,
    cancelText,
    inRoom,
    isOpen,
    setIsOpen,
    handleLeaveRoom,
    handleJoinRoom,
    slug,
    canvasDispatch
  } = useSocketWithWhiteboard();

  const { loading, result, handleDrawRequest } = useAi();
  const sendReqToAi = (command: string) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.error("no ctx");
      return;
    }
    handleDrawRequest(ctx, canvasState.textState.fontFamily, command);
  };

  const handleChatToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      console.error("canvas element not available");
      return;
    }
    console.log(typeof result);
    result.forEach((shape: DrawElement) => {
      // drawShape(ctx, shape);
      canvasDispatch({ type: "ADD_SHAPE", payload: shape });
    });
  }, [result]);

  const toolkitProps: toolkitProps = {
    canvasRef,
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    toolKitState: canvasState.toolState,
    handleRedo,
    handleUndo,
  };

  return (
    <div className={`relative h-screen w-screen duration-300`}>
      <Toolkit {...toolkitProps} />
      {/* <Button
        className="absolute top-0 left-0 z-1000"
        onClick={() => {
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) {
            console.error("no ctx");
            return;
          }
          handleDrawRequest(
            ctx,
            canvasState.textState.fontFamily,
            "any flowchart",
          );
        }}
      ></Button> */}
      {textEdit && (
        <textarea
          autoFocus
          ref={textAreaRef}
          onBlur={finishText}
          value={textEdit.text}
          onChange={(e) => setTextEdit({ ...textEdit, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishText();
            if (e.key === "Escape") cancelText();
          }}
          style={{
            position: "absolute",
            left: textEdit.x,
            top: textEdit.y,
            width: "auto",
            height: "auto",
            fontSize: canvasState.textState.fontSize,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: oklchToCSS(canvasState.toolState.currentColor),
            textAlign: canvasState.textState.alignment,
            overflow: "hidden",
            fontFamily: canvasState.textState.fontFamily,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-canvas text-white"
      ></canvas>

      {inRoom ? (
        <>
          <RoomOptions
            onChatToggle={handleChatToggle}
            isChatOpen={isOpen}
            handleLeaveRoom={handleLeaveRoom}
          />
          {roomInfo.users.map((u) => (
            <UsersCursor key={u.userId} {...u} />
          ))}
          <SideCollapseChat
            inRoom={inRoom}
            send={send}
            messages={messages}
            setMessages={setMessages}
            fetchChartFromAi={sendReqToAi}
            isOpen={isOpen}
            isLoading={loading}
            slug={slug}
          />
        </>
      ) : (
        <>
          <JoinRoomModal
            makeNewRoom={createRoomService}
            verifyJoin={handleJoinRoom}
            onChatToggle={handleChatToggle}
            isChatOpen={isOpen}
          />

          <SideCollapseChat
            inRoom={inRoom}
            send={send}
            messages={messages}
            setMessages={setMessages}
            fetchChartFromAi={sendReqToAi}
            isOpen={isOpen}
            isLoading={loading}
            slug={slug}
          />
        </>
      )}
      <ErrorModal />
    </div>
  );
};

export default page;
