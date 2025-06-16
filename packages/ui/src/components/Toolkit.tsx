"use client";
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ToolIcon } from "./ui/ToolIcon";
import { IconGripHorizontal, IconGripVertical } from "@tabler/icons-react";
import { rejects } from "assert";

export interface ToolState {
  curentTool:
    | "circle"
    | "rectangle"
    | "triangle"
    | "arrow"
    | "color"
    | "pencil"
    | "undo"
    | "redo";
  currentColor: string;
  brushSize: number;
}

const Toolkit = () => {
  const toolkitRef = useRef<HTMLDivElement | null>(null);
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    isDraging: boolean;
    dragX: number;
    dragY: number;
  }>({ isDraging: false, dragX: 0, dragY: 0 });

  const resizeRef = useRef<any | null>(null);
  const [currWidth, setCurrWidth] = useState(362);
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

    const maxX = width + window.innerWidth;
    const maxY = height + window.innerHeight;

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
    console.log(resizeState.current.isResizing);
    resizeState.current.isResizing = true;
    resizeState.current.initialX = e.clientX;
  }, []);

  const onResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.current.isResizing) return;
      console.log(resizeState.current.isResizing);

      console.log("resizing");
      let newWidth =
        resizeState.current.initialWidth +
        (e.clientX - resizeState.current.initialX);
      console.log(newWidth);

      if (newWidth > 362) {
        newWidth = 362;
      }
      if (newWidth < 62) {
        newWidth = 62;
      }
      console.log(resizeState.current.lastWidth);
      setCurrWidth(newWidth);
    },
    [currWidth]
  );

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

  return (
    <div
      ref={toolkitRef}
      className="absolute  rounded-lg flex items-center cursor-move bg-light_sky_blue outline-1 drop-shadow"
      style={{ top: currPos.y, left: currPos.x, width: `${currWidth}px` }}
    >
      <ToolIcon ref={toolIconRef} />
      <IconGripVertical
        ref={resizeRef}
        className="cursor-e-resize w-4 h-4 shrink-0 "
      />
    </div>
  );
};

export default Toolkit;
