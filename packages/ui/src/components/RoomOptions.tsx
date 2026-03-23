import { Button } from "./ui/button";
import { IconDoorExit, IconLogout, IconMessagePlus } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/ToolTip";
import ChatButton from "./ui/ChatButton";
import { motion } from "motion/react";

const RoomOptions = ({
  onChatToggle,
  isChatOpen,
  handleLeaveRoom,
}: {
  onChatToggle: () => void;
  isChatOpen: boolean;
  handleLeaveRoom: () => void;
}) => {
  return (
    <motion.div
      animate={{ x: isChatOpen ? -360 : 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-6 flex flex-col gap-2"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="w-18 h-8 rounded-r-none opacity-80 hover:opacity-100 flex p-0 shadow-shinyshadow button-press"
            variant={"destructive"}
            onClick={() => handleLeaveRoom()}
          >
            <span className="text-xs mr-1 font-google-sans-code">Exit</span>
            <IconDoorExit color={"black"} stroke={1} size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Leave Room</p>
        </TooltipContent>
      </Tooltip>
      {/* <Tooltip>
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
      </Tooltip> */}
      <ChatButton onChatToggle={onChatToggle} isChatOpen={isChatOpen} />
    </motion.div>
  );
};

export default RoomOptions;
