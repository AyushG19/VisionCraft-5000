"use client";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  SideToolkit,
  Loader,
  TextArea,
} from "@repo/ui";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import useAi from "./hooks/useAi";
import { ErrorModal } from "@workspace/ui/components/ErrorModal";
import UsersCursor from "@workspace/ui/components/ui/UsersCursor";
import { useTheme } from "next-themes";
import { DrawElement } from "@repo/common";
import { useCamera } from "./hooks/useCamera";
import { useEffect } from "react";
import { useUser } from "@repo/hooks";

const Page = () => {
  const { theme, setTheme } = useTheme();
  // useRafLoop({ cursorMap: memberCursor.current });
  const { currentUser } = useUser();
  const wb = useSocketWithWhiteboard();
  const { camera } = useCamera(
    wb.canvasRef,
    wb.canvasState.toolState.currentTool,
  );

  const { loading, result, handleDrawRequest } = useAi(
    wb.canvasRef,
    wb.canvasDispatch,
    camera,
  );

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

  useEffect(() => {
    if (!wb.canvasRef.current) return;
    const ctx = wb.canvasRef.current.getContext("2d");
    if (!ctx) {
      console.error("canvas element not available");
      return;
    }
    console.log(typeof result);
    result.forEach((shape: DrawElement) => {
      // drawShape(ctx, shape);
      // const screenPos = worldToScreen(shape.startX, shape.startY, camera);
      // const newShape = { ...shape, startX: screenPos.x, startY: screenPos.y };
      wb.canvasDispatch({ type: "ADD_SHAPE", payload: shape });
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
      <Toolkit {...toolkitProps} ref={wb.inputRef} />

      {wb.textEdit && (
        <TextArea
          textAreaRef={wb.textAreaRef}
          cancelText={wb.cancelText}
          finishText={wb.finishText}
          setTextEdit={wb.setTextEdit}
          textEditorState={wb.canvasState.textState}
          textEditState={wb.textEdit}
          toolKitState={wb.canvasState.toolState}
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
          {wb.users.map(
            (u) =>
              u.userId !== currentUser?.userId && (
                <UsersCursor key={u.userId} {...u} />
              ),
          )}
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
            makeNewRoom={wb.handleCreateRoom}
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
