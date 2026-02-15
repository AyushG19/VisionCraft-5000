import { Button } from "./ui/button";
import { IconLogout, IconMessagePlus } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/ToolTip";

const RoomOptions = ({ onChatToggle }: { onChatToggle: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2  mt-2 ">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="shadow-primary opacity-60 hover:opacity-100 mr-2"
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"sm"}
            className=" bg-light_sky_blue-700 cursor-pointer text-black aspect-square p-0 hover:opacity-100 w-full rounded-r-none"
            onClick={onChatToggle}
          >
            <IconMessagePlus stroke={1.5} size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Join Chat</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default RoomOptions;
