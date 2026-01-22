"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ToolIcon } from "./ui/ToolIcon";
import {
  Icon,
  IconGripVertical,
  IconLocation,
  IconPointer,
  IconProps,
} from "@tabler/icons-react";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircle,
  IconDropletFilled,
  IconPencilMinus,
  IconSquare,
  IconTrendingUp,
  IconTriangle,
} from "@tabler/icons-react";
import type { ToolState,ShapeType } from "@repo/common";

interface Shape {
  type: ToolState["currentTool"];
  lineWidth: number;
  lineColor: { l: number; c: number; h: number };
  fillColor: { l: number; c: number; h: number };
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
}
type State = {
  drawnShapes: ShapeType[];
  history: Shape[][];
  historyIndex: number;
  toolState: ToolState;
};
const tools: {
  id: ShapeType["type"];
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
}[] = [
  { id: "SELECT" as const, icon: IconPointer, label: "select" },
  { id: "CIRCLE" as const, icon: IconCircle, label: "circle" },
  { id: "SQUARE" as const, icon: IconSquare, label: "square" },
  { id: "TRIANGLE" as const, icon: IconTriangle, label: "triangle" },
  { id: "ARROW" as const, icon: IconTrendingUp, label: "arrow" },
  { id: "PENCIL" as const, icon: IconPencilMinus, label: "pencil" },
  { id: "COLOR" as const, icon: IconDropletFilled, label: "color" },
  { id: "UNDO" as const, icon: IconArrowBackUp, label: "undo" },
  { id: "REDO" as const, icon: IconArrowForwardUp, label: "redo" },
];
type toolkitProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  toolState: State["toolState"];
  handleToolSelect: (toolname: ToolState["currentTool"]) => void;
  handleColorSelect: (color: { l: number; c: number; h: number }) => void;
  handleStrokeSelect: (size: number) => void;
  handleUndo: () => void;
  handleRedo: () => void;
};
const Toolkit = ({
  canvasRef,
  toolState,
  handleToolSelect,
  handleColorSelect,
  handleStrokeSelect,
  handleUndo,
  handleRedo,
}: toolkitProps) => {
  const toolkitRef = useRef<HTMLDivElement | null>(null);
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    isDraging: boolean;
    dragX: number;
    dragY: number;
  }>({ isDraging: false, dragX: 0, dragY: 0 });

  const resizeRef = useRef<any | null>(null);
  const [currWidth, setCurrWidth] = useState(0);
  const resizeState = useRef<{
    isResizing: boolean;
    initialX: number;
    initialWidth: number;
    lastWidth: number;
  }>({
    isResizing: false,
    initialX: 0,
    initialWidth: 362,
    lastWidth: 362,
  });
  const toolIconRef = useRef<HTMLDivElement | null>(null);

  const getMousePos = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  useEffect(() => {
    const toolkit = toolkitRef.current;
    if (!toolkit) return;

    const resizer = resizeRef.current;
    if (!resizer) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!toolkitRef.current) return;
      const { x, y } = getMousePos(e);
      if (e.target !== resizeRef.current) {
        dragState.current.isDraging = true;
        const rect = toolkitRef.current.getBoundingClientRect();
        dragState.current = {
          ...dragState.current,
          dragX: x - rect.x,
          dragY: y - rect.y,
        };
      } else if (e.target === resizeRef.current) {
        resizeState.current.isResizing = true;
        resizeState.current.initialX = x;
        console.log("look", toolkitRef.current.scrollWidth);
        resizeState.current.initialWidth = toolkitRef.current.scrollWidth;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!toolkitRef.current) return;
      const { x, y } = getMousePos(e);
      if (dragState.current.isDraging) {
        const newX = x - dragState.current.dragX; //dragX ,Y is drag offset
        const newY = y - dragState.current.dragY;

        const width = toolkitRef.current.clientWidth;
        const height = toolkitRef.current.clientHeight;

        const adjustedX = Math.max(
          0,
          Math.min(newX, window.innerWidth - width)
        );
        const adjustedY = Math.max(
          0,
          Math.min(newY, window.innerHeight - height)
        );

        setCurrPos({
          x: adjustedX,
          y: adjustedY,
        });
      } else if (resizeState.current.isResizing) {
        if (!toolIconRef.current) return;
        const toolIconContainer = toolIconRef.current;
        console.log("resizing");
        const deltaX = x - resizeState.current.initialX;
        const newWidth = resizeState.current.initialWidth + deltaX;

        if (toolIconContainer.offsetHeight <= 40) {
          if (newWidth > toolIconContainer.clientWidth) return;
        }
        setCurrWidth(Math.max(62, newWidth));
      }
    };

    const onMouseUp = () => {
      if (dragState.current.isDraging) {
        dragState.current.isDraging = false;
        dragState.current = {
          ...dragState.current,
          dragX: 0,
          dragY: 0,
        };
      } else if (resizeState.current.isResizing) {
        resizeState.current.isResizing = false;
        resizeState.current.initialWidth = currWidth;
      }
    };

    const newX = window.innerWidth / 2 - toolkitRef.current!.clientWidth / 2;
    setCurrPos({ x: newX, y: 0 });

    toolkit.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      toolkit.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  console.log(tools.length);

  return (
    <div
      ref={toolkitRef}
      draggable={false}
      className="p-3 pb-3.5 pr-0 absolute rounded-lg flex items-center cursor-move  bg-light_sky_blue outline-personal shadow-primary "
      style={{
        top: currPos.y,
        left: currPos.x,
        maxWidth: `${!currWidth ? 31 * tools.length + (tools.length - 1) * 10 + 30 : currWidth}px`,
      }}
    >
      <div ref={toolIconRef} className="flex flex-wrap w-auto gap-2.5 z-50">
        {tools.map((tool) => {
          return (
            <ToolIcon
              isSelected={toolState.currentTool === tool.id}
              key={tool.id}
              toolInfo={tool}
              onSelectColor={handleColorSelect}
              onSelectStroke={handleStrokeSelect}
              onSelectTool={
                tool.id !== "UNDO" && tool.id !== "REDO"
                  ? handleToolSelect
                  : tool.id === "REDO"
                    ? handleRedo
                    : handleUndo
              }
            />
          );
        })}
      </div>

      <IconGripVertical
        ref={resizeRef}
        className="cursor-e-resize w-4 h-4 shrink-0 ml-1.5"
      />
    </div>
  );
};

export { Toolkit, type toolkitProps };
