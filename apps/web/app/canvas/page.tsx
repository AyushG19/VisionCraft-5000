"use client";
import React from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  ChatModal,
} from "@repo/ui";
import { AxiosResponse } from "axios";
import { drawShape } from "./utils/drawing";
import { ShapeType } from "@repo/common";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import { joinRoomService } from "app/services/canvas.service";
import redrawPreviousShapes from "./utils/redrawPreviousShapes";
import { useSocketContext } from "@repo/hooks";
import { createRoom } from "app/api/canvas.api";

let token = "";
const page = () => {
  const { inRoom, slug, roomId, setInRoom, setSlug, setRoomId } =
    useSocketContext();
  // const { send, messages } = useCanvasSocket(inRoom);

  // const {
  //   handleColorSelect,
  //   handleStrokeSelect,
  //   handleToolSelect,
  //   handleRedo,
  //   handleUndo,
  //   canvasRef,
  //   canvasState,
  //   isDrawing,
  //   canvasDispatch,
  //   wsRef,
  //   messages,
  //   setMessages,
  // } = useWhiteboardWithSocket(inRoom);
  const {
    canvasRef,
    canvasDispatch,
    canvasState,
    handleColorSelect,
    handleRedo,
    handleStrokeSelect,
    handleToolSelect,
    handleUndo,
    send,
    messages,
    setMessages,
  } = useSocketWithWhiteboard(inRoom, roomId, slug, token);

  const verifyJoin = async (code: string) => {
    try {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx == null) {
          console.error("canvas element not available");
          return;
        }
        const data = await joinRoomService(code);
        setInRoom(true);
        setRoomId(data.roomId);
        setSlug(code);
        token = data.token;

        if (data.canvasState) {
          redrawPreviousShapes(ctx, data.canvasState);
          canvasDispatch({
            type: "INITIALIZE_BOARD",
            payload: data.canvasState,
          });
        }
        console.log("From page verifyJoin: ", data);
      }
    } catch (error) {
      console.error("error in join room");
    }
  };
  const makeNewRoom = async () => {
    const res: AxiosResponse = await createRoom(canvasState.drawnShapes);
    setInRoom(true);
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
          <ChatModal
            drawShapeFromAi={drawShapeFromAi}
            boardState={canvasState.drawnShapes}
            setMessages={setMessages}
            messages={messages}
            send={send}
          />
          {/* <ChatBoxContainer
            // messages={messages}
            // setMessage={setMessages}
            wsRef={wsRef}
          /> */}
        </>
      ) : (
        <JoinRoomModal verifyJoin={verifyJoin} />
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
