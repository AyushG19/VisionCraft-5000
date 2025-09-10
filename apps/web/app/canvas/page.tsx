"use client";
import React, { useState } from "react";
import {
  RoomOptions,
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  ChatModal,
  ResizableDiv,
  TestComponent,
} from "@repo/ui";
import { ToolState } from "@repo/common/toolState";
import { Button } from "@workspace/ui/components/ui/button";
import { useWhiteBoard } from "./hooks/useWhiteBoard";
import { joinRoom } from "./api";
// export interface Shape {
//   type: ToolState["currentTool"];
//   lineWidth: number;
//   lineColor: { l: number; c: number; h: number };
//   fillColor: { l: number; c: number; h: number };
//   startX: number;
//   startY: number;
//   endX: number;
//   endY: number;
//   points?: { x: number; y: number }[];
// }
// const oklchToCSS = ({
//   l,
//   c,
//   h,
// }: {
//   l: number;
//   c: number;
//   h: number;
// }): string => {
//   return `oklch(${l} ${c} ${h})`;
// };
// export type State = {
//   drawnShapes: Shape[];
//   history: Shape[][];
//   historyIndex: number;
// };
// type Action = {
//   type: "UPDATE_DRAWNSHAPES";
//   payload: Shape[];
// };

const page = () => {
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // const isDrawing = useRef<boolean>(false);
  // const [drawnShapes, setDrawnShapes] = useState<Shape[]>([]);
  // const [history, setHistory] = useState<Shape[][]>([[]]);
  // const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [inRoom, setInRoom] = useState(false);
  // const [toolState, setToolState] = useState<ToolState>({
  //   currentTool: "none",
  //   currentColor: { l: 0.7, c: 0.1, h: 0 },
  //   brushSize: 10,
  // });

  // const drawShape = useCallback(
  //   (ctx: CanvasRenderingContext2D, shape: Shape) => {
  //     const width = shape.endX - shape.startX;
  //     const height = shape.endY - shape.startY;
  //     ctx.beginPath();
  //     ctx.strokeStyle = oklchToCSS(shape.lineColor);
  //     switch (shape.type) {
  //       case "pencil":
  //         if (shape.points && shape.points.length > 1) {
  //           ctx.beginPath();
  //           ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
  //           for (let i = 1; i < shape.points.length; i++) {
  //             ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
  //           }
  //           ctx.stroke();
  //         }
  //         break;
  //       case "arrow":
  //         const angle = Math.atan2(height, width);
  //         ctx.beginPath();
  //         ctx.moveTo(shape.startX, shape.startY);
  //         ctx.lineTo(shape.endX, shape.endY);
  //         ctx.stroke();

  //         //Draw the arrowhead
  //         ctx.beginPath();
  //         ctx.moveTo(shape.endX, shape.endY);
  //         ctx.lineTo(
  //           shape.endX - 15 * Math.cos(angle - Math.PI / 7),
  //           shape.endY - 15 * Math.sin(angle - Math.PI / 7)
  //         );
  //         ctx.stroke();
  //         ctx.beginPath();
  //         ctx.moveTo(shape.endX, shape.endY);
  //         ctx.lineTo(
  //           shape.endX - 15 * Math.cos(angle + Math.PI / 7),
  //           shape.endY - 15 * Math.sin(angle + Math.PI / 7)
  //         );
  //         ctx.stroke();
  //         break;
  //       case "circle":
  //         const centerX = shape.startX + width / 2;
  //         const centerY = shape.startY + height / 2;
  //         const radiusX = Math.abs(width / 2);
  //         const radiusY = Math.abs(height / 2);
  //         ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  //         ctx.stroke();
  //         break;
  //       case "square":
  //         ctx.strokeRect(shape.startX, shape.startY, width, height);
  //         break;
  //       case "triangle":
  //         ctx.beginPath();
  //         ctx.moveTo(shape.endX - width / 2, shape.startY);
  //         ctx.lineTo(shape.endX - width, shape.startY + height);
  //         ctx.lineTo(shape.endX, shape.endY);
  //         ctx.closePath();
  //         ctx.stroke();
  //         break;
  //       case "redo":
  //       case "undo":
  //     }
  //   },
  //   [toolState]
  // );

  // useEffect(() => {
  //   const canvas = myRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   const dpr = window.devicePixelRatio || 1;

  //   const rect = canvas.getBoundingClientRect();
  //   canvas.width = rect.width * dpr;
  //   canvas.height = rect.height * dpr;

  //   ctx.scale(dpr, dpr);

  //   ctx.lineWidth = 2;
  //   ctx.strokeStyle = oklchToCSS(toolState.currentColor);

  //   const getMousePos = (e: MouseEvent) => {
  //     return {
  //       x: e.clientX - rect.left,
  //       y: e.clientY - rect.top,
  //     };
  //   };

  //   const onMouseDown = (e: MouseEvent) => {
  //     if (!startPos.current) return;

  //     isDrawing.current = true;
  //     startPos.current = getMousePos(e);
  //     if (toolState.currentTool === "pencil") {
  //       setDrawnShapes((prevShapes) => [
  //         ...prevShapes,
  //         {
  //           type: toolState.currentTool,
  //           lineWidth: toolState.brushSize,
  //           lineColor: toolState.currentColor,
  //           fillColor: toolState.currentColor,
  //           startX: startPos.current.x,
  //           startY: startPos.current.y,
  //           endX: startPos.current.x,
  //           endY: startPos.current.y,
  //           points: [startPos.current],
  //         },
  //       ]);
  //     }
  //   };

  //   const onMouseMove = (e: MouseEvent) => {
  //     if (!isDrawing.current || !startPos.current) return;

  //     const currentPos = getMousePos(e);
  //     console.log(toolState.currentTool);

  //     if (toolState.currentTool !== "pencil") {
  //       redrawPreviousShapes({
  //         type: toolState.currentTool,
  //         lineWidth: toolState.brushSize,
  //         lineColor: toolState.currentColor,
  //         fillColor: toolState.currentColor,
  //         startX: startPos.current.x,
  //         startY: startPos.current.y,
  //         endX: currentPos.x,
  //         endY: currentPos.y,
  //       });
  //     } else {
  //       setDrawnShapes((prevShapes) => {
  //         const lastShapeIndex = drawnShapes.length - 1;
  //         const lastShape = drawnShapes[lastShapeIndex];
  //         if (lastShape && lastShape.type === "pencil") {
  //           const updatedPoints = [...(lastShape.points || []), currentPos];
  //           return [
  //             ...prevShapes.slice(0, lastShapeIndex),
  //             {
  //               ...lastShape,
  //               points: updatedPoints,
  //               endX: currentPos.x,
  //               endY: currentPos.y,
  //             },
  //           ];
  //         }
  //         return prevShapes;
  //       });
  //     }
  //   };

  //   const onMouseUp = (e: MouseEvent) => {
  //     if (!startPos.current) return;
  //     if (
  //       toolState.currentTool === "none" ||
  //       toolState.currentTool === "select"
  //     )
  //       return;
  //     isDrawing.current = false;
  //     setDrawnShapes((prevShapes) => {
  //       const previousHistory = history.slice(0, historyIndex + 1);
  //       setHistory([
  //         ...previousHistory,
  //         [
  //           ...prevShapes,
  //           {
  //             type: toolState.currentTool,
  //             lineWidth: toolState.brushSize,
  //             lineColor: toolState.currentColor,
  //             fillColor: toolState.currentColor,
  //             startX: startPos.current.x,
  //             startY: startPos.current.y,
  //             endX: e.clientX,
  //             endY: e.clientY,
  //           },
  //         ],
  //       ]);
  //       setHistoryIndex(previousHistory.length);
  //       return [
  //         ...prevShapes,
  //         {
  //           type: toolState.currentTool,
  //           lineWidth: toolState.brushSize,
  //           lineColor: toolState.currentColor,
  //           fillColor: toolState.currentColor,
  //           startX: startPos.current.x,
  //           startY: startPos.current.y,
  //           endX: e.clientX,
  //           endY: e.clientY,
  //         },
  //       ];
  //     });
  //   };

  //   const redrawPreviousShapes = (currentShape?: Shape) => {
  //     ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  //     drawnShapes.forEach((shape) => drawShape(ctx, shape));
  //     if (currentShape) {
  //       drawShape(ctx, currentShape);
  //     }
  //   };
  //   redrawPreviousShapes();
  //   console.log(drawnShapes, history, historyIndex);

  //   canvas.addEventListener("mousedown", onMouseDown);
  //   window.addEventListener("mousemove", onMouseMove);
  //   canvas.addEventListener("mouseup", onMouseUp);

  //   return () => {
  //     canvas.removeEventListener("mousedown", onMouseDown);
  //     window.removeEventListener("mousemove", onMouseMove);
  //     canvas.removeEventListener("mouseup", onMouseUp);
  //   };
  // }, [toolState, drawnShapes, history, historyIndex]);
  const {
    handleColorSelect,
    handleStrokeSelect,
    handleToolSelect,
    handleRedo,
    handleUndo,
    canvasRef,
    state,
  } = useWhiteBoard();

  // const handleToolSelect = (toolName: ToolState["currentTool"]) => {
  //   console.log(toolName);
  //   setToolState((prev) => ({ ...prev, currentTool: toolName }));
  //   console.log(toolState);
  // };

  // const handleColorSelect = (color: { l: number; c: number; h: number }) => {
  //   toolState.currentColor = color;
  // };
  // const handleStrokeSelect = (size: number) => {
  //   toolState.brushSize = size;
  // };

  // const handleRedo = () => {
  //   if (state.historyIndex < history.length - 1) {
  //     const newIndex = historyIndex + 1;
  //     const newState = history[newIndex];
  //     setDrawnShapes(newState || []);
  //     setHistoryIndex(newIndex);
  //   }
  // };
  // const handleUndo = () => {
  //   if (historyIndex > 0) {
  //     const newIndex = historyIndex - 1;
  //     const newState = history[newIndex];
  //     setDrawnShapes(newState || []);
  //     setHistoryIndex(newIndex);
  //   }
  // };

  const verifyJoin = async (code: string) => {
    const res = await joinRoom(code);
    if (res == "Authorised") {
      setInRoom(true);
    }
    console.log(res);
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
      <ChatModal />
      {/* <ResizableDiv minHeight={30} minWidth={200}> */}
      <TestComponent />
      {/* </ResizableDiv> */}
      {true ? <RoomOptions /> : <JoinRoomModal verifyJoin={verifyJoin} />}
    </div>
  );
};

export default page;
