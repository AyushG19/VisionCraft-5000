import React, { HtmlHTMLAttributes } from "react";
import { Button } from "../../button";
import {
  IconArrowAutofitRight,
  IconCross,
  IconJoinStraight,
  IconX,
} from "@tabler/icons-react";

interface CodeInputBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  toggleFunction: () => void;
  verifyJoin: () => void;
}
const CodeInputBox: React.FC<CodeInputBoxProps> = ({
  toggleFunction,
  verifyJoin,
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2 font-[google_sans_code] flex items-center justify-center gap-2 m-4">
      <Button
        onClick={() => toggleFunction()}
        size={"sm"}
        variant={"destructive"}
        className="p-2 rounded-full aspect-square outline-personal shadow-primary m-2 "
      >
        <IconX size={18} color="black" />
      </Button>
      {Array.from({ length: 4 }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          className="bg-canvas text-3xl text-white shadow-primary focus:drop-shadow-pressed outline-none w-20 h-20 text-center border rounded-lg "
        />
      ))}
      <Button
        onClick={() => verifyJoin()}
        size={"sm"}
        variant={"secondary"}
        className="p-2 rounded-full aspect-square outline-personal shadow-primary m-2"
      >
        <IconArrowAutofitRight size={18} color="black" />
      </Button>
    </div>
  );
};

export { CodeInputBox };
