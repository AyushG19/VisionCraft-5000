import React, { forwardRef } from "react";
import { cn } from "@/src/lib/utils";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ToolTip";
import { ToolState } from "@repo/common/toolState";

interface ToolIconProps extends React.ComponentProps<"div"> {
  onSelectTool: (toolname: ToolState["currentTool"]) => void;
  isSelected: boolean;
  toolInfo: {
    id: ToolState["currentTool"];
    icon: React.ElementType;
    label: string;
  };
}

const ToolIcon = React.forwardRef<HTMLDivElement, ToolIconProps>(
  ({ className, isSelected, toolInfo, onSelectTool, ...props }, ref) => {
    return (
      <Tooltip key={toolInfo.id}>
        <TooltipTrigger>
          <div
            onClick={() => onSelectTool(toolInfo.id)}
            ref={ref}
            className={`w-9 h-9 p-2.5 flex items-center justify-center cursor-pointer z-10 drop-shadow rounded-lg bg-uranian_blue outline-personal hover:scale-[103%] ${isSelected && "drop-shadow-pressed ml-0.5 mt-0.5"}`}
          >
            <toolInfo.icon />
          </div>
        </TooltipTrigger>
        <TooltipContent>{toolInfo.label}</TooltipContent>
      </Tooltip>
    );
  }
);
export { ToolIcon };
