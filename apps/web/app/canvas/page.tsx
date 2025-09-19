"use client";
import React, { useEffect, useState } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  ChatBoxContainer,
} from "@repo/ui";
import { useWhiteboardWithSocket } from "./hooks/useWhiteboardWithSocket";
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
    wsRef,
  } = useWhiteboardWithSocket(inRoom);

  useEffect(() => {}, [state.drawnShapes]);
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
        className="w-screen h-screen border bg-canvas "
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
        new room
      </Button>
      <Button
        className="absolute top-100 left-0 bg-amber-500"
        onClick={() => login()}
      >
        ayush login
      </Button>
      <Button
        className="absolute top-100 left-100 bg-amber-500"
        onClick={() =>
          wsRef.current?.send(
            JSON.stringify({
              type: "LEAVE_ROOM",
              payload: {
                userId: "b357fe14-cf67-4c71-9a00-f6636e7a7018",
                shape: {
                  id: "cdc51e8d-20dc-4a4c-8103-7547a1d09c5f",
                  type: "square",
                  lineWidth: 10,
                  lineColor: {
                    h: 0,
                    c: 0.15,
                    l: 0.7,
                  },
                  fillColor: {
                    h: 0,
                    c: 0.15,
                    l: 0.7,
                  },
                  startX: 286,
                  startY: 209,
                  endX: 495,
                  endY: 334,
                },
              },
            })
          )
        }
      >
        leave room
      </Button>
    </div>
  );
};

export default page;
