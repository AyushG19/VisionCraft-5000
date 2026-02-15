"use client";
import { IconSend2, IconSlash } from "@tabler/icons-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "./ui/MessageBubble";
import {
  MessageReceivedType,
  MessageToSendType,
  SideChatPropsType,
} from "./types";
import { useUser } from "@repo/hooks";

const SideCollapseChat = React.forwardRef<HTMLDivElement, SideChatPropsType>(
  ({ send, messages, setMessages, isOpen, fetchChartFromAi }, ref) => {
    const [placeholder, setPlaceholder] =
      useState<string>("Say hello to chat!");
    const [inputText, setInputText] = useState<string>("");
    // const [participants, setParticipants] = useState([
    //   { user_id: "u001", name: "Alex" },
    //   { user_id: "u002", name: "Maya" },
    //   { user_id: "u003", name: "Alex" },
    //   { user_id: "u004", name: "Sam" },
    // ]);
    // const [messages, setMessages] = useState([
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558000000,
    //     content: "Hey team, are we good to start?",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558010000,
    //     content: "Yes, just opening my notes.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558020000,
    //     content: "All set here.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558030000,
    //     content: "Ready to roll 👍",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558040000,
    //     content: "Great. First topic: project timeline.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558050000,
    //     content: "I think we can finish phase 1 by Friday.",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558060000,
    //     content: "Agree. I’ve already done most of the backend work.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558070000,
    //     content: "Design is 80% done; just polishing.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558080000,
    //     content: "Awesome progress everyone.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558090000,
    //     content: "Should we plan a demo for Monday?",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558100000,
    //     content: "Monday works for me.",
    //   },
    //   { sender_id: "u004", timestamp_ms: 1744558110000, content: "Same here." },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558120000,
    //     content: "Cool, I’ll schedule it.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558130000,
    //     content: "By the way, any blocker for testing?",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558140000,
    //     content: "Need sample data for edge cases.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558150000,
    //     content: "I can prepare that later today.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558160000,
    //     content: "Thanks, Sam.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558170000,
    //     content: "I’ll handle docs update tonight.",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558180000,
    //     content: "Perfect. What about deployment pipeline?",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558190000,
    //     content: "Already integrated with staging.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558200000,
    //     content: "👏 Great job.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558210000,
    //     content: "Do we need to optimize queries?",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558220000,
    //     content: "Yes, I’ll run a profiler tomorrow.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558230000,
    //     content: "I'll assist if needed.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558240000,
    //     content: "Thanks both.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558250000,
    //     content: "Shall we also refresh our test suite?",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558260000,
    //     content: "Good idea, some scripts are outdated.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558270000,
    //     content: "I’ll refactor them this week.",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558280000,
    //     content: "Let’s prioritize that.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558290000,
    //     content: "✅ Added to tasks.",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558300000,
    //     content: "Thanks Maya.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558310000,
    //     content: "Should we meet mid-week to review?",
    //   },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558320000,
    //     content: "Yes, Wednesday afternoon?",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558330000,
    //     content: "Works for me.",
    //   },
    //   { sender_id: "u003", timestamp_ms: 1744558340000, content: "Same." },
    //   { sender_id: "u004", timestamp_ms: 1744558350000, content: "👍" },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558360000,
    //     content: "Alright, meeting locked.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558370000,
    //     content: "Anything else for today?",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558380000,
    //     content: "Not from me.",
    //   },
    //   { sender_id: "u004", timestamp_ms: 1744558390000, content: "All good." },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558400000,
    //     content: "Okay, let's wrap.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558410000,
    //     content: "Great work folks 🎉",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558420000,
    //     content: "Catch you later.",
    //   },
    //   { sender_id: "u004", timestamp_ms: 1744558430000, content: "Bye!" },
    //   {
    //     sender_id: "u001",
    //     timestamp_ms: 1744558440000,
    //     content: "Bye everyone.",
    //   },
    //   {
    //     sender_id: "u002",
    //     timestamp_ms: 1744558450000,
    //     content: "Logging off now.",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558460000,
    //     content: "See you tomorrow.",
    //   },
    //   {
    //     sender_id: "u004",
    //     timestamp_ms: 1744558470000,
    //     content: "Have a nice evening.",
    //   },
    //   {
    //     sender_id: "u001",
    //     name: "daru",
    //     timestamp_ms: 1744558480000,
    //     content: "You too!",
    //   },
    //   {
    //     sender_id: "u001",
    //     name: "daru",
    //     timestamp_ms: 1744558490000,
    //     content: "Remember to update docs before Friday.",
    //   },
    //   {
    //     sender_id: "u003",
    //     timestamp_ms: 1744558500000,
    //     content: "Will do!",
    //   },
    //   {
    //     sender_id: "u001",
    //     name: "daru",
    //     timestamp_ms: 1744558510000,
    //     content: "I’ll check staging for bugs tonight.",
    //   },
    //   {
    //     sender_id: "u001",
    //     name: "daru",
    //     timestamp_ms: 1744558520000,
    //     content: "Perfect, thanks team.",
    //   },
    // ]);

    // const colotAttachedParticipants: Record<string, ParticipantColor> =
    //   attachColorsToParticipants(participants);

    const { currentUser } = useUser();
    const handleMessageSend = async (content: string) => {
      const userId = currentUser?.userId;
      if (!userId) {
        console.log("no userID");
        return;
      }
      console.log("content: ", content);
      if (content.startsWith("/draw")) {
        const command = content.replace("/draw", "");
        console.log("content 2: ", content);
        fetchChartFromAi(command);
      }
      const name = currentUser?.name;
      if (!name) return;
      console.log("sending mess");
      const userMessage: MessageReceivedType = {
        sender_id: userId,
        name: name,
        status: "TO_FRONTEND",
        timeStamp_ms: 2355,
        content: content,
      };
      const messageToBackend: MessageToSendType = {
        name: name,
        status: "TO_BACKEND",
        content: content,
      };
      setMessages((prev) => [...prev, userMessage]);
      send("CHAT", messageToBackend);
    };
    return (
      <div
        ref={ref}
        className={`
  flex flex-col items-center justify-center
  h-full w-[360px]
  bg-light_sky_blue shadow-primary overflow-hidden
  z-[1000]

`}

        // style={{ gridArea: "right" }}
      >
        {/* <div
          onClick={() => setIsChatUp((prev) => !prev)}
          className={`flex items-center justify-center w-7 h-5 rounded-b-full top-0 left-1/2 -translate-x-1/2 absolute bg-light_sky_blue opacity-60 hover:opacity-100 group transition-all ease-in ${isChatUp ? "rounded-xl border-t-0 border border-black" : undefined} z-30 cursor-pointer `}
        >
          {isChatUp ? (
            <IconChevronsDown
              className="hover:animate-bounce hover:m-0 repeat-infinite mb-1"
              size={15}
              stroke={2}
            />
          ) : (
            <IconChevronsUp
              className="hover:animate-bounce hover:m-0 repeat-infinite mb-1"
              size={15}
              stroke={2}
            />
          )}
        </div> */}

        {isOpen && (
          <div
            className={`w-full relative !h-full  bg-light_sky_blue-700 overflow-hidden`}
          >
            <div
              className="
    absolute inset-0
    bg-[url('/pattern-2.svg')]
    bg-repeat
    bg-top-left
    opacity-20
    pointer-events-none
  "
            />

            <Virtuoso
              data={messages}
              //   skipAnimationFrameInResizeObserver={true}
              initialTopMostItemIndex={messages.length - 1}
              itemContent={(index, message) => {
                const prev = index > 0 ? messages[index - 1] : null;
                const next =
                  index < messages.length - 1 ? messages[index + 1] : null;

                const isSameAsPrev =
                  prev && prev.sender_id === message.sender_id;
                const isSameAsNext =
                  next && next.sender_id === message.sender_id;

                let position: "single" | "first" | "middle" | "last";

                if (!isSameAsPrev && !isSameAsNext) {
                  position = "single"; // standalone message
                } else if (!isSameAsPrev && isSameAsNext) {
                  position = "first"; // first in a group
                } else if (isSameAsPrev && isSameAsNext) {
                  position = "middle"; // middle of a group
                } else if (isSameAsPrev && !isSameAsNext) {
                  position = "last"; // last in a group
                }
                const userId = currentUser?.userId;
                if (!userId) return;
                const isOwn = message.sender_id === userId;

                return (
                  <MessageBubble
                    key={message.sender_id ?? `${message.sender_id}-${index}`} // Better key
                    message={message}
                    isOwn={isOwn}
                    positionInBlock={position!}
                  />
                );
              }}
            />
          </div>
        )}

        <div
          draggable={false}
          className="p-2 flex w-full h-14 gap-1.5 mt-auto items-center justify-center overflow-visible border-t"
        >
          <div
            onMouseEnter={() => setPlaceholder("Ask AI for help!")}
            onMouseLeave={() => setPlaceholder("Say hello to chat!")}
            className="outline-personal h-full aspect-square rounded-md cursor-pointer p-1 bg-light_sky_blue-700 hover:bg-light_sky_blue flex items-center justify-center"
          >
            <IconSlash />
          </div>
          <input
            value={inputText}
            onInput={(e) => setInputText(e.currentTarget.value)}
            disabled={!isOpen}
            placeholder={placeholder}
            className="font-[google_sans_code] placeholder:text-xs text-sm min-w-40 max-w-200 h-full flex-1 rounded-md bg-white px-2 outline-personal "
          ></input>
          <Button
            onClick={() => {
              handleMessageSend(inputText);
              setInputText("");
            }}
            className={`translate-x-0 rounded-full aspect-square p-0 h-full items-center justify-center flex shadow-pressed ${!isOpen && " rotate-90 shadow-none"} transition-all ease-in`}
          >
            <IconSend2 fill="black" size={18} stroke={1} color="" />
          </Button>
        </div>
      </div>
    );
  },
);

export default SideCollapseChat;
