"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  IconMessage,
  IconMessageCircleUser,
  IconMessagePlus,
} from "@tabler/icons-react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/ToolTip";
import { CodeInputBox } from "./ui/CodeInputBox";

const JoinRoomModal = ({
  verifyJoin,
}: {
  verifyJoin: (code: string) => void;
}) => {
  const [showInputBox, setShowInputBox] = useState(false);

  const toggleShowInputBox = () => {
    setShowInputBox((prev) => !prev);
  };
  return (
    <>
      {showInputBox ? (
        <CodeInputBox
          verifyJoin={verifyJoin}
          toggleFunction={toggleShowInputBox}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => toggleShowInputBox()}
              className=" absolute right-0 top-0 m-6 font-[google_sans_code] bg-light_sky_blue cursor-pointer text-black rounded-full p-1 aspect-square "
            >
              <IconMessagePlus stroke={1.5} size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>join chat</TooltipContent>
        </Tooltip>
      )}
    </>
  );
};

export default JoinRoomModal;
