import React from "react";
import ChatModal from "./ChatModal";
import { Button } from "./ui/button";
import { IconLogout, IconMessagePlus } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/ToolTip";

const RoomOptions = () => {
  return (
    <div className="flex items-center justify-center gap-2 absolute top-0 right-0 m-6 z-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"sm"}
            className=" bg-light_sky_blue cursor-pointer text-black aspect-square p-0 opacity-60 hover:opacity-100"
          >
            <IconMessagePlus stroke={1.5} size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Join Chat</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="shadow-primary opacity-60 hover:opacity-100"
            variant={"destructive"}
            size={"sm"}
          >
            <IconLogout color={"black"} stroke={1.5} size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Leave Room</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default RoomOptions;
