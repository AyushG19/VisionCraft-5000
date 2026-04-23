"use client";
import { useState } from "react";
import {
  IconSquareArrowRight,
  IconSquarePlus,
  IconUserShare,
} from "@tabler/icons-react";
import ChatButton from "./ui/ChatButton";
import { useError } from "@repo/hooks";
import { AppError } from "@repo/common";
import { AnimatePresence, motion } from "motion/react";
import { CodeInputBox } from "./ui/CodeInputBox";

const JoinRoomModal = ({
  verifyJoin,
  makeNewRoom,
  onChatToggle,
  isChatOpen,
}: {
  verifyJoin: (code: string) => Promise<void>;
  makeNewRoom: () => Promise<void>;
  onChatToggle: () => void;
  isChatOpen: boolean;
}) => {
  const [showInputBox, setShowInputBox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useError();

  const toggleShowInputBox = async () => {
    setShowInputBox((prev) => !prev);
  };

  const handleCreateRoom = async () => {
    try {
      setIsLoading(true);
      await makeNewRoom();
    } catch (error) {
      if (error instanceof AppError) {
        setError({ code: error.code, message: error.message });
      } else {
        //@ts-ignore
        setError({ code: "UNKNOWN_ERROR", message: error!.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (code: string) => {
    try {
      setIsLoading(true);
      await verifyJoin(code);
    } catch (error) {
      if (error instanceof AppError) {
        setError({ code: error.code, message: error.message });
      } else {
        //@ts-ignore
        setError({ code: "UNKNOWN_ERROR", message: error!.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed right-0 top-6 flex flex-col gap-2 transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isChatOpen ? "-translate-x-[360px]" : "translate-x-0"
        }`}
      >
        {/* ── Room button group ── */}
        <div className="group flex flex-col">
          {/* Room pill — rounded-tl + rounded-bl normally, loses rounded-bl on hover */}
          <button
            className="
              w-18 h-8 flex gap-1 items-center justify-center
              text-primary-contrast bg-primary text-xs font-normal font-google-sans-code
              rounded-l-lg rounded-r-none
              group-hover:rounded-bl-none
              transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
             group-hover:scale-105
              cursor-default p-0 outline-1 outline-global-shadow
            "
          >
            <span className="text-xs font-normal font-google-sans-code">
              Room
            </span>
            <IconUserShare color="currentColor" size={15} stroke={1.5} />
          </button>

          {/* ── Expanding drawer — uses grid-rows trick so it takes real space ── */}
          <div
            className="
              grid
              grid-rows-[0fr] group-hover:grid-rows-[1fr]
              transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
              group opacity-70 group-hover:opacity-100
            "
          >
            <div className="overflow-hidden flex flex-col">
              {/* New — flat all sides, sits flush against Room button */}
              <button
                onClick={() => handleCreateRoom()}
                className="
                  w-18 h-8 flex gap-1 items-center justify-center
                  bg-secondary text-black text-xs font-normal font-google-sans-code
                  rounded-none
                  hover:bg-primary-700 hover:text-primary-contrast
                  transition-all duration-150 cursor-pointer border-personal
                "
              >
                {isLoading && !showInputBox ? (
                  <span className="text-xs font-normal font-google-sans-code">
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-normal font-google-sans-code">
                      New
                    </span>
                    <IconSquarePlus size={15} stroke={1.5} />
                  </>
                )}
              </button>

              {/* Join — flat top, rounded-bl, flat right — closes the group */}
              <button
                onClick={toggleShowInputBox}
                className="
                  w-18 h-8 flex gap-1 items-center justify-center
                  bg-secondary text-black text-xs font-normal font-google-sans-code
                  rounded-none rounded-bl-xl
                  hover:bg-primary-700 hover:text-primary-contrast
                  transition-all duration-150 cursor-pointer border-personal
                "
              >
                <span className="text-xs font-normal font-google-sans-code">
                  Join
                </span>
                <IconSquareArrowRight size={15} stroke={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat button — pushed down naturally as drawer expands */}
        <ChatButton isChatOpen={isChatOpen} onChatToggle={onChatToggle} />
      </div>

      {/* Code input overlay */}
      <AnimatePresence>
        {showInputBox && (
          <motion.div
            key="input-box"
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 z-50 bg-primary outline-1 outline-global-shadow rounded-md shadow-shinyprimary"
          >
            <CodeInputBox
              verifyJoin={handleJoinRoom}
              toggleFunction={toggleShowInputBox}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JoinRoomModal;
