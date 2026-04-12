"use client";
import React, { useEffect, useRef, useState } from "react";
import { ToolIcon } from "./ui/ToolIcon";
import {
  Icon,
  IconGripVertical,
  IconLine,
  IconPhoto,
  IconProps,
  IconSend,
  IconSquareRotated,
  IconTextSize,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircle,
  IconDropletFilled,
  IconPencilMinus,
  IconSquare,
  IconTrendingUp,
  IconHandStop,
  IconDroplet,
} from "@tabler/icons-react";
import type {
  ToolKitType,
  DrawElement,
  AllToolTypes,
  ColorType,
} from "@repo/common";
import { Button } from "./ui/button";

const tools: {
  id: AllToolTypes;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
}[] = [
  { id: "select" as const, icon: IconSend, label: "select" },
  { id: "hand" as const, icon: IconHandStop, label: "hand" },
  { id: "ellipse" as const, icon: IconCircle, label: "circle" },
  { id: "rectangle" as const, icon: IconSquare, label: "square" },
  { id: "diamond" as const, icon: IconSquareRotated, label: "diamond" },
  { id: "line" as const, icon: IconLine, label: "line" },
  { id: "arrow" as const, icon: IconTrendingUp, label: "arrow" },
  { id: "pencil" as const, icon: IconPencilMinus, label: "pencil" },
  { id: "text" as const, icon: IconTextSize, label: "text" },
  { id: "image" as const, icon: IconPhoto, label: "image" },
  { id: "color" as const, icon: IconDroplet, label: "color" },
];

type toolkitProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  toolKitState: ToolKitType;
  handleToolSelect: (toolname: AllToolTypes) => void;
  handleColorSelect: (color: ColorType) => void;
  handleStrokeSelect: (size: number) => void;
  handleUndo: () => void;
  handleRedo: () => void;
};

const Toolkit = React.forwardRef<HTMLInputElement, toolkitProps>(
  (
    {
      canvasRef,
      toolKitState,
      handleToolSelect,
      handleColorSelect,
      handleStrokeSelect,
      handleUndo,
      handleRedo,
    },
    inputRef,
  ) => {
    const toolkitRef = useRef<HTMLDivElement | null>(null);
    const toolIconRef = useRef<HTMLDivElement | null>(null);
    const resizeRef = useRef<any | null>(null);

    const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
    const [currWidth, setCurrWidth] = useState(0);
    const [maxWidth, setMaxWidth] = useState(0);

    const dragState = useRef<{
      isDraging: boolean;
      dragX: number;
      dragY: number;
    }>({ isDraging: false, dragX: 0, dragY: 0 });

    const resizeState = useRef<{
      isResizing: boolean;
      initialX: number;
      initialWidth: number;
    }>({
      isResizing: false,
      initialX: 0,
      initialWidth: 0,
    });

    const getMousePos = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Calculate max width on mount
    useEffect(() => {
      if (!toolkitRef.current || !toolIconRef.current) return;

      const calculateMaxWidth = () => {
        if (!toolkitRef.current || !toolIconRef.current) return;

        const toolIconContainer = toolIconRef.current;
        const naturalWidth = toolIconContainer.scrollWidth;

        const totalMaxWidth = naturalWidth + 12 + 16 + 6;

        setMaxWidth(totalMaxWidth);
        setCurrWidth(totalMaxWidth);

        // Center the toolkit
        const newX = window.innerWidth / 2 - totalMaxWidth / 2;
        setCurrPos({ x: Math.max(0, newX), y: 0 });
      };

      setTimeout(calculateMaxWidth, 0);
    }, []);

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
          resizeState.current.initialWidth = currWidth;
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!toolkitRef.current) return;
        const { x, y } = getMousePos(e);

        if (dragState.current.isDraging) {
          const newX = x - dragState.current.dragX;
          const newY = y - dragState.current.dragY;

          const width = toolkitRef.current.clientWidth;
          const height = toolkitRef.current.clientHeight;

          const adjustedX = Math.max(
            0,
            Math.min(newX, window.innerWidth - width),
          );
          const adjustedY = Math.max(
            0,
            Math.min(newY, window.innerHeight - height),
          );

          setCurrPos({
            x: adjustedX,
            y: adjustedY,
          });
        } else if (resizeState.current.isResizing) {
          const deltaX = x - resizeState.current.initialX;
          const newWidth = resizeState.current.initialWidth + deltaX;

          // Constrain width between minimum (62px) and maximum (one row width)
          const constrainedWidth = Math.max(62, Math.min(newWidth, maxWidth));
          setCurrWidth(constrainedWidth);
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
        }
      };

      toolkit.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      return () => {
        toolkit.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [currWidth, maxWidth]);

    return (
      <div
        ref={toolkitRef}
        draggable={false}
        className="p-3 pb-3.5 pr-0 absolute rounded-lg flex items-center cursor-move bg-primary outline-1 outline-global-shadow shadow-shinyprimary z-20"
        style={{
          top: currPos.y,
          left: currPos.x,
          width: currWidth > 0 ? `${currWidth}px` : "auto",
          maxWidth: maxWidth > 0 ? `${maxWidth}px` : "none",
        }}
      >
        <div ref={toolIconRef} className="flex flex-wrap w-auto gap-2.5 z-50">
          {tools.map((tool) => {
            return (
              <ToolIcon
                ref={inputRef}
                isSelected={toolKitState.currentTool === tool.id}
                key={tool.id}
                toolInfo={tool}
                onSelectColor={handleColorSelect}
                onSelectStroke={handleStrokeSelect}
                onSelectTool={handleToolSelect}
              />
            );
          })}
          {/* <div className="h-8 w-[1px] ml-1 mt-1 bg-black"></div> */}
          <Button
            className="w-9 h-9 p-0 flex items-center justify-center cursor-pointer shadow-shinysecondary bg-secondary text-secondary-contrast button-press-active transition-all ease-in-out duration-100 outline-1 outline-global-shadow"
            onClick={handleUndo}
          >
            <IconArrowBackUp size={15} stroke={1.5} />
          </Button>
          <Button
            className="w-9 h-9 p-0 flex items-center justify-center cursor-pointer text-secondary-contrast shadow-shinysecondary bg-secondary button-press-active transition-all ease-in-out duration-100 outline-1 outline-global-shadow "
            onClick={handleRedo}
          >
            <IconArrowForwardUp size={15} stroke={1.5} />
          </Button>
        </div>

        <IconGripVertical
          ref={resizeRef}
          className="cursor-e-resize w-4 h-4 shrink-0 ml-1.5"
        />
      </div>
    );
  },
);

export { Toolkit, type toolkitProps };
