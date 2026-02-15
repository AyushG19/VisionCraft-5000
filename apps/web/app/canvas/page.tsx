"use client";
import React, { useRef } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  Button,
  mermaidToExcalidraw,
} from "@repo/ui";
import { drawShape } from "./utils/drawing";
import { DrawElement } from "@repo/common";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import {
  createRoomService,
  fetchChartService,
} from "app/services/canvas.service";
import oklchToCSS from "./utils/oklchToCss";
import useJoinRoom from "./hooks/useRoom";

const page = () => {
  const {
    inRoom,
    roomId,
    slug,
    token,
    isOpen,
    handleChatToggle,
    handleJoinRoom,
  } = useJoinRoom();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

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
  } = useSocketWithWhiteboard(roomId, slug, token, isOpen);

  const drawShapeFromAi = (shapes: DrawElement[]) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx == null) {
      console.error("canvas element not available");
      return;
    }
    console.log(typeof shapes);
    shapes.forEach((shape: DrawElement) => {
      drawShape(ctx, shape);
    });
  };

  async function fetchChartFromAi(userCommand: string) {
    try {
      const diagramDefination = await fetchChartService(userCommand);
      console.log(diagramDefination);
      const res = await mermaidToExcalidraw(diagramDefination.res);
      console.log(res);
      drawShapeFromAi(res);
    } catch (error) {}
  }

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
      <Button
        className="absolute top-0 left-0 z-1000"
        // onClick={fetchChartFromAi}
      ></Button>
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
        className="w-full h-full block border bg-canvas "
      ></canvas>

      {inRoom ? (
        <div
          className={`h-full flex items-start absolute top-0 right-0 float-right 
  transform transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "translate-x-90"}`}
        >
          <RoomOptions onChatToggle={handleChatToggle} />
          <SideCollapseChat
            send={send}
            messages={messages}
            setMessages={setMessages}
            fetchChartFromAi={fetchChartFromAi}
            isOpen={isOpen}
          />
        </div>
      ) : (
        <JoinRoomModal
          makeNewRoom={createRoomService}
          verifyJoin={handleJoinRoom}
        />
      )}
    </div>
  );
};

export default page;
