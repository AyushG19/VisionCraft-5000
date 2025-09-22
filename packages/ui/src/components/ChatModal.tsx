import {
  IconChevronCompactDown,
  IconChevronCompactRight,
  IconChevronCompactUp,
  IconChevronDown,
  IconChevronsDown,
  IconSend2,
  IconSlash,
} from "@tabler/icons-react";
import React, { RefObject, useEffect, useState } from "react";
import { Button } from "../button";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "./ui/MessageBubble";
import { attachColorsToParticipants } from "../lib/colorMapper";
interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
}
interface ParticipantColor {
  name: string;
  color: string;
}
const ChatModal = React.forwardRef<HTMLDivElement, ChatModalProps>(
  ({ wsRef }, ref) => {
    const [isChatUp, setIsChatUp] = useState(false);
    const [placeholder, setPlaceholder] =
      useState<string>("Say hello to chat!");
    const [participants, setParticipants] = useState([
      { user_id: "u001", name: "Alex" },
      { user_id: "u002", name: "Maya" },
      { user_id: "u003", name: "Alex" },
      { user_id: "u004", name: "Sam" },
    ]);
    const [messages, setMessages] = useState([
      {
        sender_id: "u001",
        timestamp_ms: 1744558000000,
        content: "Hey team, are we good to start?",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558010000,
        content: "Yes, just opening my notes.",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558020000,
        content: "All set here.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558030000,
        content: "Ready to roll 👍",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558040000,
        content: "Great. First topic: project timeline.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558050000,
        content: "I think we can finish phase 1 by Friday.",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558060000,
        content: "Agree. I’ve already done most of the backend work.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558070000,
        content: "Design is 80% done; just polishing.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558080000,
        content: "Awesome progress everyone.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558090000,
        content: "Should we plan a demo for Monday?",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558100000,
        content: "Monday works for me.",
      },
      { sender_id: "u004", timestamp_ms: 1744558110000, content: "Same here." },
      {
        sender_id: "u001",
        timestamp_ms: 1744558120000,
        content: "Cool, I’ll schedule it.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558130000,
        content: "By the way, any blocker for testing?",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558140000,
        content: "Need sample data for edge cases.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558150000,
        content: "I can prepare that later today.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558160000,
        content: "Thanks, Sam.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558170000,
        content: "I’ll handle docs update tonight.",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558180000,
        content: "Perfect. What about deployment pipeline?",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558190000,
        content: "Already integrated with staging.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558200000,
        content: "👏 Great job.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558210000,
        content: "Do we need to optimize queries?",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558220000,
        content: "Yes, I’ll run a profiler tomorrow.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558230000,
        content: "I'll assist if needed.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558240000,
        content: "Thanks both.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558250000,
        content: "Shall we also refresh our test suite?",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558260000,
        content: "Good idea, some scripts are outdated.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558270000,
        content: "I’ll refactor them this week.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558280000,
        content: "Let’s prioritize that.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558290000,
        content: "✅ Added to tasks.",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558300000,
        content: "Thanks Maya.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558310000,
        content: "Should we meet mid-week to review?",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558320000,
        content: "Yes, Wednesday afternoon?",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558330000,
        content: "Works for me.",
      },
      { sender_id: "u003", timestamp_ms: 1744558340000, content: "Same." },
      { sender_id: "u004", timestamp_ms: 1744558350000, content: "👍" },
      {
        sender_id: "u001",
        timestamp_ms: 1744558360000,
        content: "Alright, meeting locked.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558370000,
        content: "Anything else for today?",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558380000,
        content: "Not from me.",
      },
      { sender_id: "u004", timestamp_ms: 1744558390000, content: "All good." },
      {
        sender_id: "u001",
        timestamp_ms: 1744558400000,
        content: "Okay, let's wrap.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558410000,
        content: "Great work folks 🎉",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558420000,
        content: "Catch you later.",
      },
      { sender_id: "u004", timestamp_ms: 1744558430000, content: "Bye!" },
      {
        sender_id: "u001",
        timestamp_ms: 1744558440000,
        content: "Bye everyone.",
      },
      {
        sender_id: "u002",
        timestamp_ms: 1744558450000,
        content: "Logging off now.",
      },
      {
        sender_id: "u003",
        timestamp_ms: 1744558460000,
        content: "See you tomorrow.",
      },
      {
        sender_id: "u004",
        timestamp_ms: 1744558470000,
        content: "Have a nice evening.",
      },
      { sender_id: "u001", timestamp_ms: 1744558480000, content: "You too!" },
      {
        sender_id: "u003",
        timestamp_ms: 1744558490000,
        content: "Remember to update docs before Friday.",
      },
      { sender_id: "u002", timestamp_ms: 1744558500000, content: "Will do!" },
      {
        sender_id: "u004",
        timestamp_ms: 1744558510000,
        content: "I’ll check staging for bugs tonight.",
      },
      {
        sender_id: "u001",
        timestamp_ms: 1744558520000,
        content: "Perfect, thanks team.",
      },
    ]);

    const colotAttachedParticipants: Record<string, ParticipantColor> =
      attachColorsToParticipants(participants);

    const handleMessageSend = () => {};
    return (
      <div
        ref={ref}
        className="absolute bottom-0 right-0 m-8 py-2 flex flex-col gap-1.5 min-h-7 w-80 h-100 items-center justify-center rounded-xl z-30 bg-light_sky_blue shadow-primary outline-primary border border-personal overflow-hidden"
      >
        {isChatUp ? (
          <IconChevronCompactUp
            className="-m-0.5 top-0 absolute z-50"
            size={18}
            stroke={3}
          />
        ) : (
          <div className="w-full !h-86 pb-2 relative rounded-md bg-light_sky_blue-700 border-personal ">
            <div className="-mt-0.5 w-6 h-6 top-0 left-1/2 -translate-1/2 absolute  bg-light_sky_blue p-1 rounded-xl border border-black"></div>
            <Virtuoso
              className={`w-full `}
              data={messages}
              skipAnimationFrameInResizeObserver={true}
              initialTopMostItemIndex={messages.length - 1}
              itemContent={(index, message) => (
                <MessageBubble
                  isOwn={message.sender_id === "u001"}
                  messageStyle={colotAttachedParticipants[message.sender_id]}
                  index={index}
                  message={message}
                />
              )}
            ></Virtuoso>
          </div>
        )}

        <div
          draggable={false}
          className="px-2 reltative flex w-full gap-1.5 mt-auto items-center justify-center overflow-visible"
        >
          <div
            onMouseEnter={() => setPlaceholder("Ask AI for help!")}
            onMouseLeave={() => setPlaceholder("Say hello to chat!")}
            className="absolute left-3 outline-personal w-6 h-6 rounded-full cursor-pointer p-1 bg-light_sky_blue-700 hover:bg-light_sky_blue"
          >
            <IconSlash size={15} />
          </div>
          <input
            placeholder={placeholder}
            className="font-[google_sans_code] placeholder:text-xs text-sm min-w-40 max-w-200 h-8 flex-1 rounded-2xl bg-white mr-0 py-4 pr-1.5 pl-9 outline-personal "
          ></input>
          <Button
            onClick={handleMessageSend}
            className="rounded-full aspect-square p-0 w-7 h-7 ml-0 items-center justify-center flex shadow-pressed"
            size={"sm"}
          >
            <IconSend2 fill="black" size={18} stroke={1} color="" />
          </Button>
        </div>
      </div>
    );
  }
);

export default ChatModal;
