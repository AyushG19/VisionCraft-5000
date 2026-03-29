"use client";
import React, { useEffect, useState } from "react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";
import { AllToolTypes, ColorType } from "@repo/common";
import { ColorSelector } from "./ColorSelector";

const oklchToCssHsl = (l: number, c: number, h: number) => {
  const hue = h;
  const saturation = Math.min(100, c * 200);
  const lightness = Math.min(100, l * 100);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

interface ToolIconProps extends React.ComponentProps<"div"> {
  onSelectTool: (toolname: AllToolTypes) => void;
  onSelectColor: (color: ColorType) => void;
  onSelectStroke: (size: number) => void;
  isSelected: boolean;
  toolInfo: {
    id: AllToolTypes;
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
    ref,
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
            className={`w-9 h-9 ${toolInfo.id === "color" ? "p-2" : "p-2.5"} relative flex items-center justify-center cursor-pointer z-10 shadow-[inset_1px_1px_2px_white,3px_3px_black] rounded-lg bg-uranian_blue outline-personal hover:scale-[103%] ${toolInfo.id !== "color" && isSelected && "button-press"} button-press-active transition-all ease-in-out duration-100`}
          >
            {toolInfo.id === "color" && isHovered && (
              <ColorSelector
                selectedColor={pickedColor}
                setSelectedColor={setPickedColor}
              />
            )}
            <toolInfo.icon
              fill={toolInfo.id === "color" ? `oklch(${pickedColor.l} ${pickedColor.c} ${pickedColor.h})` : "none"}
              // color={toolInfo.id === "color" ? `oklch(${pickedColor.l} ${pickedColor.c} ${pickedColor.h})` : "currentColor"}
              // style={{ color: toolInfo.id === "color" ? `oklch(${pickedColor.l} ${pickedColor.c} ${pickedColor.h})` : undefined }}
              stroke={toolInfo.id === "color" ? 1 : 1.5}
            />

          </div>
        </TooltipTrigger>
        {!(toolInfo.id === "color") && (
          <TooltipContent>{toolInfo.label}</TooltipContent>
        )}
      </Tooltip>
    );
  },
);
export { ToolIcon };
