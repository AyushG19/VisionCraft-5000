import { IconSend2 } from "@tabler/icons-react";
import React from "react";
import { Button } from "../button";

const ChatModal = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div
      ref={ref}
      className="p-2 flex flex-col min-h-7 w-full h-full items-center justify-center rounded-md z-30 bg-light_sky_blue shadow-primary"
    >
      <div></div>
      <div
        draggable={false}
        className="flex w-full gap-1.5 mt-auto items-center justify-center overflow-visible"
      >
        <input className="font-[google_sans_code] text-sm min-w-40 max-w-200 h-7 flex-1 rounded-2xl bg-light_sky_blue-700 mr-0 px-3 py-1.5 outline-personal "></input>
        <Button
          className="rounded-full aspect-square p-0 w-7 h-7 ml-0 items-center justify-center flex shadow-pressed"
          size={"sm"}
        >
          <IconSend2 fill="black" size={18} stroke={1} color="" />
        </Button>
      </div>
    </div>
  );
});

export default ChatModal;
