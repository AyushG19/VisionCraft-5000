"use client";
import React, { useState } from "react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";
import { AllToolTypes, ColorType } from "@repo/common";
import { ColorSelector } from "./ColorSelector";
import { Button } from "./button";

interface ToolIconProps extends React.ComponentProps<"div"> {
  onSelectTool: (toolname: AllToolTypes) => void;
  onSelectColor: (color: ColorType) => void;
  isSelected: boolean;
  toolInfo: {
    id: AllToolTypes;
    icon: React.ElementType;
    label: string;
  };
  initialColor: ColorType;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const ToolIcon = React.forwardRef<HTMLButtonElement, ToolIconProps>(
  (
    {
      className,
      isSelected,
      toolInfo,
      onSelectTool,
      onSelectColor,
      initialColor,
      inputRef,
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    if (toolInfo.id === "image") {
      return (
        <div
          className={`w-6 h-6 lg:w-9 lg:h-9 relative flex items-center justify-center z-10 shadow-shinysecondary-mobile lg:shadow-shinysecondary rounded-md lg:rounded-lg bg-secondary pointer-events-none outline-1 outline-global-shadow scale-[97%] hover:scale-100 ${isSelected && "button-press"} button-press-active transition-transform ease-in-out duration-100 text-secondary-contrast`}
        >
          <label>
            <input
              ref={inputRef}
              className="absolute text-transparent top-0 left-0 w-full h-full cursor-pointer pointer-events-auto"
              type="file"
              id="fileInput"
              accept="image/*"
            ></input>
          </label>
          <toolInfo.icon
            color={"currentColor"}
            className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
            fill={"none"}
            stroke={1.5}
          />
        </div>
      );
    }
    return (
      <Tooltip key={toolInfo.id}>
        <TooltipTrigger asChild>
          <Button
            aria-label={toolInfo.label}
            ref={ref}
            variant={"secondary"}
            onClick={() => onSelectTool(toolInfo.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-6 h-6 lg:w-9 lg:h-9 p-0 relative flex items-center justify-center cursor-pointer z-10 outline-1 outline-global-shadow shadow-shinysecondary-mobile lg:shadow-shinysecondary rounded-md lg:rounded-lg scale-[97%] hover:scale-100 ${toolInfo.id !== "color" && isSelected && "pointer-events-none button-press"} button-press-active transition-all ease-in-out duration-100 text-secondary-contrast`}
          >
            {toolInfo.id === "color" && isHovered && (
              <ColorSelector
                selectedColor={initialColor}
                setSelectedColor={onSelectColor}
              />
            )}
            <toolInfo.icon
              color={"currentColor"}
              fill={
                toolInfo.id === "color"
                  ? `oklch(${initialColor.l} ${initialColor.c} ${initialColor.h})`
                  : "none"
              }
              className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
              stroke={toolInfo.id === "color" ? 1 : 1.5}
            />
          </Button>
        </TooltipTrigger>
        {!(toolInfo.id === "color") && (
          <TooltipContent>{toolInfo.label}</TooltipContent>
        )}
      </Tooltip>
    );
  },
);
export { ToolIcon };
