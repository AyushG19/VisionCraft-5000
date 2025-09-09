import {
  IconChevronCompactUp,
  IconMessagePlus,
  IconSquareRoundedArrowRightFilled,
} from "@tabler/icons-react";
import React from "react";
import { Button } from "../button";

const ChatModal = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-md absolute bottom-0 right-0 m-6 mr-18.5 z-30 bg-light_sky_blue shadow-primary">
      {/* <div className="">
        <IconChevronCompactUp className="-mb-4" size={15} color="black" />
        <IconChevronCompactUp size={15} color="black" />
      </div> */}
      <div className="flex items-center justify-center">
        <input className="min-w-40 max-w-200 h-7 rounded-2xl bg-light_sky_blue-700 m-1 mr-0 px-3 py-1"></input>
        <IconSquareRoundedArrowRightFilled className="m-1" />
      </div>
    </div>
  );
};

export default ChatModal;
