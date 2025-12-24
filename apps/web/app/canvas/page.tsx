"use client";
import React, { useState } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  ChatModal,
} from "@repo/ui";
import { useWhiteboardWithSocket } from "./hooks/useWhiteboardWithSocket";
import { createRoom, joinRoom, login } from "../api";
import { Button } from "@repo/ui/button";
import { AxiosResponse } from "axios";
import { drawShape } from "./utils/drawing";
import { ShapeType } from "@repo/common/types";
import { createContext } from "vm";
import { createRoomService, joinRoomService } from "app/services";

const page = () => {
  const [inRoom, setInRoom] = useState(false);
  // const { send, messages } = useCanvasSocket(inRoom);

  const {
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    handleRedo,
    handleUndo,
    canvasRef,
    canvasState,
    isDrawing,
    canvasDispatch,
    wsRef,
    messages,
    setMessages,
  } = useWhiteboardWithSocket(inRoom);

  const verifyJoin = async (code: string) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx == null) {
        console.error("canvas element not available");
        return;
      }
      const res = await joinRoomService(code);
      if (!res) return;
      setInRoom(true);
      drawShape(ctx, res.canvasState);
      canvasDispatch({
        type: "INITIALIZE_BOARD",
        payload: [res.canvasState],
      });

      console.log("From page verifyJoin: ", res);
    }
  };
  const makeNewRoom = async () => {
    const res = await createRoomService(canvasState.drawnShapes);
    if (res) {
      setInRoom(true);
      alert(res.slug);
    }
  };

  const drawShapeFromAi = (shapes: ShapeType[]) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx == null) {
      console.error("canvas element not available");
      return;
    }
    shapes.forEach((shape: ShapeType) => {
      drawShape(ctx, shape);
    });
  };
  const toolkitProps: toolkitProps = {
    canvasRef,
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    toolState: canvasState.toolState,
    handleRedo,
    handleUndo,
  };

  return (
    <div className="relative w-screen h-screen ">
      <Toolkit {...toolkitProps} />
      <canvas
        ref={canvasRef}
        className="w-screen h-screen border bg-canvas "
      ></canvas>
      {/* <Button className="absolute top-0 left-0" onClick={() => send("hii")}>
        send
      </Button> */}

      {inRoom ? (
        <>
          <RoomOptions />
          {/* <ChatModal
            drawShapeFromAi={drawShapeFromAi}
            boardState={canvasState.drawnShapes}
            setMessages={setMessages}
            messages={messages}
            wsRef={wsRef}
          /> */}
          {/* <ChatBoxContainer
            // messages={messages}
            // setMessage={setMessages}
            wsRef={wsRef}
          /> */}
        </>
      ) : (
        <JoinRoomModal makeNewRoom={makeNewRoom} verifyJoin={verifyJoin} />
      )}
      {/* <div className="absolute top-0 left-0 gap-2 flex">
        <Button className="" onClick={makeNewRoom}>
          new room
        </Button>
        <Button className=" bg-pink-500" onClick={() => login()}>
          ayush login
        </Button>
        <Button
          className=" bg-amber-500"
          onClick={() => {
            const userId = localStorage.getItem("userId");
            if (!wsRef.current || !userId) {
              return;
            }
            setInRoom(false);
            wsRef.current.send(
              JSON.stringify({
                type: "LEAVE_ROOM",
                payload: { userId: userId },
              })
            );
          }}
        >
          leave room
        </Button>
      </div> */}
    </div>
  );
};

export default page;
