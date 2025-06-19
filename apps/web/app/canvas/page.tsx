"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Toolkit from "@repo/ui/Toolkit";

import { ToolState } from "@repo/common/toolState";
interface Shape {
  type: ToolState["currentTool"];
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
}
const page = () => {
  const myRef = useRef<HTMLCanvasElement | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const [drawnShapes, setDrawnShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [toolState, setToolState] = useState<ToolState>({
    currentTool: "none",
    currentColor: "#00000",
    brushSize: 10,
  });

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Shape) => {
      ctx.beginPath();
      switch (shape.type) {
        case "pencil":
          if (shape.points && shape.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case "arrow":
        case "circle":
        case "select":
        case "square":
          let startX = shape.startX;
          let startY = shape.startY;
          let w = shape.endX - shape.startX;
          let h = shape.endY - shape.startY;
          ctx.strokeRect(startX, startY, w, h);
          break;
        case "triangle":
        case "redo":
        case "undo":
      }
    },
    [toolState]
  );

  useEffect(() => {
    const canvas = myRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.lineWidth = 2;
    ctx.strokeStyle = toolState.currentColor;

    const getMousePos = (e: MouseEvent) => {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!startPos.current) return;

      isDrawing.current = true;
      startPos.current = getMousePos(e);
      if (toolState.currentTool === "pencil") {
        setDrawnShapes((prevShapes) => [
          ...prevShapes,
          {
            type: toolState.currentTool,
            lineWidth: toolState.brushSize,
            lineColor: toolState.currentColor,
            fillColor: toolState.currentColor,
            startX: startPos.current.x,
            startY: startPos.current.y,
            endX: startPos.current.x,
            endY: startPos.current.y,
            points: [startPos.current],
          },
        ]);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing.current || !startPos.current) return;

      const currentPos = getMousePos(e);
      console.log(toolState.currentTool);

      if (toolState.currentTool !== "pencil") {
        redrawPreviousShapes({
          type: toolState.currentTool,
          lineWidth: toolState.brushSize,
          lineColor: toolState.currentColor,
          fillColor: toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: currentPos.x,
          endY: currentPos.y,
        });
      } else {
        setDrawnShapes((prevShapes) => {
          const lastShapeIndex = drawnShapes.length - 1;
          const lastShape = drawnShapes[lastShapeIndex];
          if (lastShape && lastShape.type === "pencil") {
            const updatedPoints = [...(lastShape.points || []), currentPos];
            return [
              ...prevShapes.slice(0, lastShapeIndex),
              {
                ...lastShape,
                points: updatedPoints,
                endX: currentPos.x,
                endY: currentPos.y,
              },
            ];
          }
          return prevShapes;
        });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!startPos.current) return;
      isDrawing.current = false;
      setDrawnShapes((prevShapes) => [
        ...prevShapes,
        {
          type: toolState.currentTool,
          lineWidth: toolState.brushSize,
          lineColor: toolState.currentColor,
          fillColor: toolState.currentColor,
          startX: startPos.current.x,
          startY: startPos.current.y,
          endX: e.clientX,
          endY: e.clientY,
        },
      ]);
    };

    const redrawPreviousShapes = (currentShape?: Shape) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawnShapes.forEach((shape) => drawShape(ctx, shape));
      if (currentShape) {
        drawShape(ctx, currentShape);
      }
    };
    console.log(drawnShapes);
    redrawPreviousShapes();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [toolState, drawnShapes, drawShape]);

  const handleToolSelect = (toolName: ToolState["currentTool"]) => {
    console.log(toolName);
    setToolState((prev) => ({ ...prev, currentTool: toolName }));
    console.log(toolState);
  };

  return (
    <div className="w-screen h-screen ">
      <Toolkit handleToolSelect={handleToolSelect} toolState={toolState} />
      <canvas
        ref={myRef}
        className="w-full h-full border bg-thistle-400 "
      ></canvas>
    </div>
  );
};

export default page;
