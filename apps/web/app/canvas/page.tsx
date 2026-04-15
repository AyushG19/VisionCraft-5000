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

const Page = () => {
  const { theme, setTheme } = useTheme();
  // useRafLoop({ cursorMap: memberCursor.current });

  const wb = useSocketWithWhiteboard();

  const { loading, handleDrawRequest } = useAi(wb.canvasRef, wb.canvasDispatch);

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
          {wb.users.map((u) => (
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
