"use client";
import React, { Component, forwardRef, useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ToolTip";
import { ToolState } from "@repo/common/toolState";
import ColorSelector from "./ColorSelector";

const oklchToCssHsl = (l: number, c: number, h: number) => {
  const hue = h;
  const saturation = Math.min(100, c * 200); // Convert chroma to a more perceptual saturation
  const lightness = Math.min(100, l * 100); // Convert lightness (0-1) to HSL lightness (0-100)
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

interface ToolIconProps extends React.ComponentProps<"div"> {
  onSelectTool: (toolname: ToolState["currentTool"]) => void;
  onSelectColor: (color: { l: number; c: number; h: number }) => void;
  onSelectStroke: (size: number) => void;
  isSelected: boolean;
  toolInfo: {
    id: ToolState["currentTool"];
    icon: React.ElementType;
    label: string;
  };
}

const ToolIcon = React.forwardRef<HTMLDivElement, ToolIconProps>(
  (
    {
      className,
      isSelected,
      toolInfo,
      onSelectTool,
      onSelectColor,
      onSelectStroke,
    },
    ref
  ) => {
    const [pickedColor, setPickedColor] = useState<{
      l: number;
      c: number;
      h: number;
    }>({ h: 0, c: 0.15, l: 0.7 }); // Initial color for demonstration
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      onSelectColor(pickedColor);
    }, [pickedColor]);
    return (
      <Tooltip key={toolInfo.id}>
        <TooltipTrigger>
          <div
            onClick={() => onSelectTool(toolInfo.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={ref}
            className={`w-9 h-9 p-2.5 flex items-center justify-center cursor-pointer z-10 shadow-primary rounded-lg bg-uranian_blue outline-personal hover:scale-[103%] ${toolInfo.id !== "color" && isSelected && "shadow-pressed ml-0.5 mt-0.5 "} transition-all ease-in`}
          >
            {toolInfo.id === "color" && isHovered && (
              <ColorSelector
                selectedColor={pickedColor}
                setSelectedColor={setPickedColor}
              />
            )}
            <toolInfo.icon
              color={
                toolInfo.id === "color"
                  ? `oklch(${pickedColor.l} ${pickedColor.c} ${pickedColor.h}`
                  : "black"
              }
            />
          </div>
        </TooltipTrigger>
        {!(toolInfo.id === "color") && (
          <TooltipContent>{toolInfo.id}</TooltipContent>
        )}
      </Tooltip>
    );
  }
);
export { ToolIcon };
