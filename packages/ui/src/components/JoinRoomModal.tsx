"use client";
import React, { useState } from "react";
import { Button } from "../button";
import {
  IconMessage,
  IconMessageCircleUser,
  IconMessagePlus,
} from "@tabler/icons-react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/ToolTip";
import { CodeInputBox } from "./ui/CodeInputBox";

const JoinRoomModal = ({
  verifyJoin,
  makeNewRoom,
}: {
  verifyJoin: (code: string) => void;
  makeNewRoom: () => void;
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
        <div className=" absolute right-0 top-0 m-6  ">
          <div className="relative group">
            <Button className="hover:scale-100 h-auto font-[google_sans_code] text-black  shadow-primary text-xs">
              Room
            </Button>
            <ul className="absolute left-0 w-full bg-light_sky_blue rounded-xl rounded-t-none opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto shadow-primary -mt-3">
              <li className="h-3"></li>
              <li
                onClick={makeNewRoom}
                className="text-center py-2 hover:bg-gray-100 bg-light_sky_blue-700 font-[google_sans_code] cursor-pointer text-xs"
              >
                Create
              </li>
              <li
                onClick={toggleShowInputBox}
                className="text-center py-2 hover:bg-gray-100 bg-light_sky_blue-700 rounded-lg rounded-t-none font-[google_sans_code] cursor-pointer text-xs"
              >
                Join
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinRoomModal;
