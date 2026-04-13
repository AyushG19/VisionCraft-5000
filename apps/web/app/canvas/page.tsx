"use client";
import React, { useEffect, useRef } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  SideToolkit,
  Loader,
} from "@repo/ui";
import { DrawElement } from "@repo/common";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import { createRoomService } from "app/services/canvas.service";
import oklchToCSS from "../lib/oklchToCss";
import useAi from "./hooks/useAi";
import { useSocketContext } from "@repo/hooks";
import { ErrorModal } from "@workspace/ui/components/ErrorModal";
import UsersCursor from "@workspace/ui/components/ui/UsersCursor";
import useRafLoop from "./hooks/useRafLoop";
import { useTheme } from "next-themes";

const Page = () => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { roomInfo, memberCursor } = useSocketContext();

  const { theme, setTheme } = useTheme();
  useRafLoop({ cursorMap: memberCursor.current });

  const wb = useSocketWithWhiteboard();
  const canvas = wb.canvasRef.current;

  const { loading, result, handleDrawRequest } = useAi();
  const sendReqToAi = (command: string) => {
    const ctx = wb.canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.error("no ctx");
      return;
    }
    handleDrawRequest(ctx, wb.canvasState.textState.fontFamily, command);
  };

  const handleChatToggle = () => {
    wb.setIsOpen((prev) => !prev);
  };

  const canvasDispatch = wb.canvasDispatch;
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
    canvasRef: wb.canvasRef,
    handleColorSelect: wb.handleColorSelect,
    handleStrokeSelect: wb.handleStrokeSelect,
    handleToolSelect: wb.handleToolSelect,
    toolKitState: wb.canvasState.toolState,
    handleRedo: wb.handleRedo,
    handleUndo: wb.handleUndo,
  };

  return (
    <div className={`relative h-screen w-screen duration-300`}>
      {/* {toolkitProps.toolKitState.currentTool === "image" && ( */}
      {/* <input
        className="absolute w-10 h-10 bg-amber-400"
        type="file"
        id="fileInput"
        accept="image/*"
      /> */}
      {/* )} */}
      <Toolkit {...toolkitProps} ref={wb.inputRef} />
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
      {wb.textEdit && (
        <textarea
          autoFocus
          ref={textAreaRef}
          onBlur={wb.finishText}
          value={wb.textEdit.text}
          onChange={(e) =>
            wb.setTextEdit({ ...wb.textEdit!, text: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") wb.finishText();
            if (e.key === "Escape") wb.cancelText();
          }}
          style={{
            position: "absolute",
            left: wb.textEdit.x,
            top: wb.textEdit.y,
            width: "auto",
            height: "auto",
            fontSize: wb.canvasState.textState.fontSize,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: oklchToCSS(wb.canvasState.toolState.currentColor),
            textAlign: wb.canvasState.textState.alignment,
            overflow: "hidden",
            fontFamily: wb.canvasState.textState.fontFamily,
          }}
        />
      )}
      <canvas
        ref={wb.canvasRef}
        className="w-full h-full bg-canvas text-white"
      ></canvas>
      <Loader></Loader>
      <SideToolkit
        selectedShape={wb.selectedShape}
        tool={wb.canvasState.toolState.currentTool}
        onChange={() => {}}
        onDelete={() => {}}
        panelRef={wb.sideToolkitRef}
        theme={theme}
        setTheme={setTheme}
        editorState={wb.canvasState.sideToolKitState}
        setEditorState={wb.setEditorState}
        textState={wb.canvasState.textState}
        setTextState={wb.setTextState}
        shapeEditHelpers={{
          handleColorSelect: wb.handleColorSelect,
          handleStrokeSelect: wb.handleStrokeSelect,
          handleElementDelete: wb.handleElementDelete,
          handleStrokeStyle: wb.handleStrokeStyle,
          handleFillSelect: wb.handleFillSelect,
          handleFontSize: wb.handleFontSize,
          handleFontFamily: wb.handleFontFamily,
        }}
      ></SideToolkit>

      {wb.inRoom ? (
        <>
          <RoomOptions
            onChatToggle={handleChatToggle}
            isChatOpen={wb.isOpen}
            handleLeaveRoom={wb.handleLeaveRoom}
          />
          {roomInfo.users.map((u) => (
            <UsersCursor key={u.userId} {...u} />
          ))}
          <SideCollapseChat
            inRoom={wb.inRoom}
            send={wb.send}
            messages={wb.messages}
            setMessages={wb.setMessages}
            fetchChartFromAi={sendReqToAi}
            isOpen={wb.isOpen}
            isLoading={loading}
            slug={wb.slug}
          />
        </>
      ) : (
        <>
          <JoinRoomModal
            makeNewRoom={createRoomService}
            verifyJoin={wb.handleJoinRoom}
            onChatToggle={handleChatToggle}
            isChatOpen={wb.isOpen}
          />

          <SideCollapseChat
            inRoom={wb.inRoom}
            send={wb.send}
            messages={wb.messages}
            setMessages={wb.setMessages}
            fetchChartFromAi={sendReqToAi}
            isOpen={wb.isOpen}
            isLoading={loading}
            slug={wb.slug}
          />
        </>
      )}
      <ErrorModal />
    </div>
  );
};

export default Page;
