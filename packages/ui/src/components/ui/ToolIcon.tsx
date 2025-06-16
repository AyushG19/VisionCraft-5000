import React, { forwardRef } from "react";
import { cn } from "@/src/lib/utils";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ToolTip";
import { ref } from "process";
const tools = [
  { id: "circle" as const, icon: IconCircle, label: "circle" },
  { id: "square" as const, icon: IconSquare, label: "square" },
  { id: "triangle" as const, icon: IconTriangle, label: "triangle" },
  { id: "arrow" as const, icon: IconTrendingUp, label: "arrow" },
  { id: "pencil" as const, icon: IconPencilMinus, label: "pencil" },
  { id: "color" as const, icon: IconDropletFilled, label: "color" },
  { id: "undo" as const, icon: IconArrowBackUp, label: "undo" },
  { id: "redo" as const, icon: IconArrowForwardUp, label: "redo" },
];

const ToolIcon = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="flex flex-wrap gap-2.5 m-1.5 mb-3">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger>
              <div
                ref={ref}
                className="w-9 h-9 p-2.5 flex items-center justify-center cursor-pointer z-10 drop-shadow rounded-lg bg-uranian_blue outline-1 "
              >
                <tool.icon />
              </div>
            </TooltipTrigger>
            <TooltipContent>{tool.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }
);
export { ToolIcon };
