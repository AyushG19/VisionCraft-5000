"use client";
import React, { useEffect, useState } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  ChatBoxContainer,
} from "@repo/ui";
import { useWhiteBoard } from "./hooks/useWhiteBoard";
import { createRoom, joinRoom, login } from "./api";
import { useCanvasSocket } from "./hooks/useCanvasSocket";
import { Button } from "@workspace/ui/button";
import { AxiosResponse } from "axios";
import { drawShape } from "./utils/drawing";
import { useRouter } from "next/navigation";
import { useRoomID } from "./hooks/useRoomID";

const page = () => {
  const [inRoom, setInRoom] = useState(false);
  const [inChat, setInChat] = useState(false);
  // const { send, messages } = useCanvasSocket(inRoom);

  const {
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    handleRedo,
    handleUndo,
    canvasRef,
    state,
    isDrawing,
    dispatch,
  } = useWhiteBoard(inRoom);

  const verifyJoin = async (code: string) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx == null) {
        console.error("canvas element not available");
        return;
      }
      const res: AxiosResponse = await joinRoom(code);
      if (res.status == 200) {
        setInRoom(true);
        drawShape(ctx, res.data.canvasState);
        dispatch({ type: "INITIALIZE_BOARD", payload: res.data.canvasState });
      }
      console.log("From page verifyJoin: ", res);
    }
  };
  const makeNewRoom = async () => {
    const res: AxiosResponse = await createRoom(state.drawnShapes);
    setInRoom(true);
  };
  const toolkitProps: toolkitProps = {
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    toolState: state.toolState,
    handleRedo,
    handleUndo,
  };

  return (
    <div className="relative w-screen h-screen ">
      <Toolkit {...toolkitProps} />
      <canvas
        ref={canvasRef}
        className="w-full h-full border bg-canvas "
      ></canvas>
      {/* <Button className="absolute top-0 left-0" onClick={() => send("hii")}>
        send
      </Button> */}
      {inRoom ? (
        <>
          <RoomOptions />
          <ChatBoxContainer />
        </>
      ) : (
        <JoinRoomModal verifyJoin={verifyJoin} />
      )}
      <Button className="absolute top-100 left-200" onClick={makeNewRoom}>
        send
      </Button>
      <Button
        className="absolute top-100 left-0 bg-amber-500"
        onClick={() => login()}
      >
        send
      </Button>
    </div>
  );
};

export default page;
