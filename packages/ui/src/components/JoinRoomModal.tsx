"use client";
import React, { useState } from "react";
import { CodeInputBox } from "./ui/CodeInputBox";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
  IconMessagePlus,
  IconSquareArrowRight,
  IconSquarePlus,
  IconUserShare,
} from "@tabler/icons-react";
import ChatButton from "./ui/ChatButton";

const JoinRoomModal = ({
  verifyJoin,
  makeNewRoom,
  onChatToggle,
  isChatOpen,
}: {
  verifyJoin: (code: string) => void;
  makeNewRoom: () => void;
  onChatToggle: () => void;
  isChatOpen: boolean;
}) => {
  const [showInputBox, setShowInputBox] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleShowInputBox = () => {
    setShowInputBox((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const handleCreateRoom = () => {
    makeNewRoom();
    setIsDropdownOpen(false);
  };

  return (
    <motion.div
      animate={{ x: isChatOpen ? -360 : 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-6 flex flex-col gap-2"
    >
      <AnimatePresence mode="wait">
        {showInputBox ? (
          <motion.div
            key="input-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <CodeInputBox
              verifyJoin={verifyJoin}
              toggleFunction={toggleShowInputBox}
            />
          </motion.div>
        ) : (
          <motion.div
            key="room-button"
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-r-none"
          >
            <div className="relative">
              <Button
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className={`hover:scale-100 w-18 h-8 font-google-sans-code flex gap-1 text-black shadow-shinyshadow text-xs rounded-r-none transition-all p-0 ${
                  isDropdownOpen ? "rounded-b-none" : ""
                }`}
              >
                <span className="text-xs font-normal font-[google_sans_code]">
                  Room
                </span>
                <IconUserShare size={15} stroke={1.5} />
              </Button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                    className="absolute left-0 w-full bg-light_sky_blue shadow-primary overflow-hidden rounded-bl-xl"
                  >
                    <motion.li
                      onClick={handleCreateRoom}
                      whileHover={{ backgroundColor: "rgb(243 244 246)", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.08 }}
                      className="list-none text-center p-0 h-8 bg-light_sky_blue-700 font-google-sans-code cursor-pointer text-xs flex gap-1 items-center justify-center"
                    >
                      <span className="text-xs font-normal font-[google_sans_code]">
                        New
                      </span>
                      <IconSquarePlus size={15} stroke={1.5} />
                    </motion.li>
                    <motion.li
                      onClick={toggleShowInputBox}
                      whileHover={{ backgroundColor: "rgb(243 244 246)", x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.08 }}
                      className="list-none text-center p-0 h-8 bg-light_sky_blue-700 rounded-bl-xl font-google-sans-code cursor-pointer text-xs flex gap-1 items-center justify-center"
                    >
                      <span className="text-xs font-normal font-[google_sans_code]">
                        Join
                      </span>
                      <IconSquareArrowRight size={15} stroke={1.5} />
                    </motion.li>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ChatButton isChatOpen={isChatOpen} onChatToggle={onChatToggle} />
    </motion.div>
  );
};

export default JoinRoomModal;
