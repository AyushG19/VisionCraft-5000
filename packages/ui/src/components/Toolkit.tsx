"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ToolIcon } from "./ui/ToolIcon";
import {
  IconGripVertical,
  IconLocation,
  IconPointer,
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
import type { ToolState } from "@repo/common/toolState";
import ColorBoxes from "./ui/ColorBoxes";

const tools = [
  { id: "select" as const, icon: IconPointer, label: "select" },
  { id: "circle" as const, icon: IconCircle, label: "circle" },
  { id: "square" as const, icon: IconSquare, label: "square" },
  { id: "triangle" as const, icon: IconTriangle, label: "triangle" },
  { id: "arrow" as const, icon: IconTrendingUp, label: "arrow" },
  { id: "pencil" as const, icon: IconPencilMinus, label: "pencil" },
  { id: "color" as const, icon: IconDropletFilled, label: "color" },
  { id: "undo" as const, icon: IconArrowBackUp, label: "undo" },
  { id: "redo" as const, icon: IconArrowForwardUp, label: "redo" },
];
export interface toolkitProps {
  toolState: ToolState;
  handleToolSelect: (toolname: ToolState["currentTool"]) => void;
  handleColorSelect: (color: { l: number; c: number; h: number }) => void;
  handleStrokeSelect: (size: number) => void;
  handleUndo: () => void;
  handleRedo: () => void;
}
const Toolkit = ({
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

  const [colorVisibility, setColorVisibility] = useState(false);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.target != toolkitRef.current) return;
    dragState.current.isDraging = true;
    const rect = toolkitRef.current!.getBoundingClientRect();
    dragState.current = {
      ...dragState.current,
      dragX: e.clientX - rect.left,
      dragY: e.clientY - rect.top,
    };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDraging || !toolkitRef.current) return;

    const newX = e.clientX - dragState.current.dragX;
    const newY = e.clientY - dragState.current.dragY;

    const width = toolkitRef.current.clientWidth;
    const height = toolkitRef.current.clientHeight;

    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    const adjustedX = Math.max(0, Math.min(newX, maxX));
    const adjustedY = Math.max(0, Math.min(newY, maxY));

    setCurrPos({
      x: adjustedX,
      y: adjustedY,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current.isDraging = false;
    dragState.current = {
      ...dragState.current,
      dragX: 0,
      dragY: 0,
    };
  }, []);

  const onResizeMouseDown = useCallback((e: MouseEvent) => {
    if (!toolkitRef.current) return;
    console.log(resizeState.current.isResizing);
    resizeState.current.isResizing = true;
    resizeState.current.initialX = e.clientX;
    resizeState.current.initialWidth = toolkitRef.current.scrollWidth;
  }, []);

  const onResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.current.isResizing) return;
    if (!toolIconRef.current) return;
    if (!toolkitRef.current) return;

    const toolIconContainer = toolIconRef.current;
    console.log("resizing");

    let newWidth =
      resizeState.current.initialWidth +
      (e.clientX - resizeState.current.initialX);
    console.log(
      resizeState.current.initialWidth,
      newWidth,
      toolIconContainer.scrollWidth + 25
    );
    if (toolIconContainer.scrollHeight <= 40) {
      if (newWidth > toolIconContainer.clientWidth) return;
    }
    setCurrWidth(Math.max(62, newWidth));
  }, []);

  const onResizeMouseUp = useCallback(() => {
    resizeState.current.isResizing = false;
    resizeState.current.initialWidth = currWidth;
  }, [currWidth]);

  useEffect(() => {
    const toolkit = toolkitRef.current;
    if (!toolkit) return;

    const resizer = resizeRef.current;
    if (!resizer) return;

    toolkit.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    resizer.addEventListener("mousedown", onResizeMouseDown);
    window.addEventListener("mousemove", onResizeMouseMove);
    window.addEventListener("mouseup", onResizeMouseUp);

    return () => {
      toolkit.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      resizer.removeEventListener("mousedown", onResizeMouseDown);
      window.removeEventListener("mousemove", onResizeMouseMove);
      window.removeEventListener("mouseup", onResizeMouseUp);
    };
  }, [
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onResizeMouseDown,
    onResizeMouseMove,
    onResizeMouseUp,
  ]);

  useEffect(() => {
    const toolkit = toolkitRef.current;
    if (!toolkit) return;

    setCurrPos({
      x: window.innerWidth / 2 - toolkit.clientWidth / 2,
      y: 0,
    });
    toolkit.classList.remove("translate-x-1/2");
  }, []);

  console.log(tools.length);

  return (
    <div
      ref={toolkitRef}
      className="p-3 pb-3.5 pr-0 absolute rounded-lg flex items-center cursor-move bg-light_sky_blue outline-personal shadow-primary "
      style={{
        top: currPos.y,
        left: currPos.x,
        width: `${!currWidth ? 33.5 * tools.length + (tools.length - 1) * 10 + 30 : currWidth}px`,
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
                tool.id !== "undo" && tool.id !== "redo"
                  ? handleToolSelect
                  : tool.id === "redo"
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

export default Toolkit;
