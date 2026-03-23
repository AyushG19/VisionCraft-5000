import React, { useRef, useState } from "react";
import { Button } from "./button";
import { IconArrowAutofitRight, IconX } from "@tabler/icons-react";

interface CodeInputBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  toggleFunction: () => void;
  verifyJoin: (code: string) => void;
}
const CodeInputBox: React.FC<CodeInputBoxProps> = ({
  toggleFunction,
  verifyJoin,
}) => {
  const [code, setCode] = useState(new Array(4).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  console.log(code);
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const value = e.target.value;
    if (!value) return;

    setCode((prev) => {
      const newArr = [...prev];
      newArr[idx] = value;
      return newArr;
    });

    if (idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // prevent default deletion weirdness
      setCode((prev) => {
        const newArr = [...prev];
        if (prev[idx]) {
          // If current box has value, clear it
          newArr[idx] = "";
        } else if (idx > 0) {
          // If empty, move back and clear previous
          newArr[idx - 1] = "";
          inputRefs.current?.[idx - 1]?.focus();
        }
        return newArr;
      });

      // If current box empty, focus previous box
      if (!code[idx] && idx > 0) {
        inputRefs.current?.[idx - 1]?.focus();
      }
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-1/2 font-[google_sans_code] flex items-center justify-center gap-2 m-4">
      <Button
        onClick={() => toggleFunction()}
        size={"sm"}
        variant={"destructive"}
        className="p-2 rounded-full aspect-square outline-personal shadow-primary m-2 "
      >
        <IconX size={18} color="black" />
      </Button>
      {code.map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          maxLength={1}
          value={code[i]}
          onChange={(e) => handleOnchange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="bg-canvas text-3xl text-white shadow-primary focus:drop-shadow-pressed outline-none w-20 h-20 text-center border rounded-lg "
        />
      ))}
      <Button
        onClick={() => verifyJoin(code.join(""))}
        size={"sm"}
        disabled={!code[3]}
        variant={"secondary"}
        className={`disabled:opacity-60 disabled:scale-100 p-2 rounded-full aspect-square outline-personal shadow-primary m-2`}
      >
        <IconArrowAutofitRight size={18} color="black" />
      </Button>
    </div>
  );
};

export { CodeInputBox };
