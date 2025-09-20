import { IconSend2, IconSlash } from "@tabler/icons-react";
import React, { RefObject, useEffect, useState } from "react";
import { Button } from "../button";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "./ui/MessageBubble";
interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
}
const ChatModal = React.forwardRef<HTMLDivElement, ChatModalProps>(
  ({ wsRef }, ref) => {
    const [placeholder, setPlaceholder] =
      useState<string>("Say hello to chat!");
    const [messages, setMessages] = useState([
      {
        id: 1,
        user: "Alice",
        content: "Hey! How are you?",
      },
      {
        id: 2,
        user: "Bob",
        content:
          "I'm good, thanks! Just working on a new project that involves React Virtuoso. It's really cool!",
      },
      {
        id: 3,
        user: "Alice",
        content:
          "Oh nice! I heard Virtuoso is great for handling large lists efficiently. Are you building a chat app?",
      },
      {
        id: 4,
        user: "Bob",
        content:
          "Yes! It's a dynamic chat interface. Users can scroll up to load older messages. Each message may have variable heights, images, or even long text paragraphs. Here's an example of a longer message to test scrolling behavior in Virtuoso:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      },
      {
        id: 5,
        user: "Alice",
        content:
          "Wow, that’s quite long! This should test the variable height rendering nicely.",
      },
      {
        id: 6,
        user: "Bob",
        content: "Exactly. Also, some messages might be very short.",
      },
      {
        id: 7,
        user: "Alice",
        content: "👍",
      },
      {
        id: 8,
        user: "Bob",
        content:
          "Here’s a medium-length message to fill the chat and test smooth scrolling and virtualization behavior in the app.",
      },
      {
        id: 9,
        user: "Alice",
        content:
          "Great! This should cover short, medium, and long messages for testing.",
      },
      {
        id: 10,
        user: "Bob",
        content:
          "Finally, a very long message to really stress test the scroll behavior. Imagine this goes on and on, with multiple paragraphs, emojis, code snippets, or anything else a user might send in a real chat scenario.\n\n1. Bullet point one\n2. Bullet point two\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        id: 1,
        user: "Alice",
        content: "Hey! How are you?",
      },
      {
        id: 2,
        user: "Bob",
        content:
          "I'm good, thanks! Just working on a new project that involves React Virtuoso. It's really cool!",
      },
      {
        id: 3,
        user: "Alice",
        content:
          "Oh nice! I heard Virtuoso is great for handling large lists efficiently. Are you building a chat app?",
      },
      {
        id: 4,
        user: "Bob",
        content:
          "Yes! It's a dynamic chat interface. Users can scroll up to load older messages. Each message may have variable heights, images, or even long text paragraphs. Here's an example of a longer message to test scrolling behavior in Virtuoso:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      },
      {
        id: 5,
        user: "Alice",
        content:
          "Wow, that’s quite long! This should test the variable height rendering nicely.",
      },
      {
        id: 6,
        user: "Bob",
        content: "Exactly. Also, some messages might be very short.",
      },
      {
        id: 7,
        user: "Alice",
        content: "👍",
      },
      {
        id: 8,
        user: "Bob",
        content:
          "Here’s a medium-length message to fill the chat and test smooth scrolling and virtualization behavior in the app.",
      },
      {
        id: 9,
        user: "Alice",
        content:
          "Great! This should cover short, medium, and long messages for testing.",
      },
      {
        id: 10,
        user: "Bob",
        content:
          "Finally, a very long message to really stress test the scroll behavior. Imagine this goes on and on, with multiple paragraphs, emojis, code snippets, or anything else a user might send in a real chat scenario.\n\n1. Bullet point one\n2. Bullet point two\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        id: 1,
        user: "Alice",
        content: "Hey! How are you?",
      },
      {
        id: 2,
        user: "Bob",
        content:
          "I'm good, thanks! Just working on a new project that involves React Virtuoso. It's really cool!",
      },
      {
        id: 3,
        user: "Alice",
        content:
          "Oh nice! I heard Virtuoso is great for handling large lists efficiently. Are you building a chat app?",
      },
      {
        id: 4,
        user: "Bob",
        content:
          "Yes! It's a dynamic chat interface. Users can scroll up to load older messages. Each message may have variable heights, images, or even long text paragraphs. Here's an example of a longer message to test scrolling behavior in Virtuoso:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      },
      {
        id: 5,
        user: "Alice",
        content:
          "Wow, that’s quite long! This should test the variable height rendering nicely.",
      },
      {
        id: 6,
        user: "Bob",
        content: "Exactly. Also, some messages might be very short.",
      },
      {
        id: 7,
        user: "Alice",
        content: "👍",
      },
      {
        id: 8,
        user: "Bob",
        content:
          "Here’s a medium-length message to fill the chat and test smooth scrolling and virtualization behavior in the app.",
      },
      {
        id: 9,
        user: "Alice",
        content:
          "Great! This should cover short, medium, and long messages for testing.",
      },
      {
        id: 10,
        user: "Bob",
        content:
          "Finally, a very long message to really stress test the scroll behavior. Imagine this goes on and on, with multiple paragraphs, emojis, code snippets, or anything else a user might send in a real chat scenario.\n\n1. Bullet point one\n2. Bullet point two\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
      {
        id: 1,
        user: "Alice",
        content: "Hey! How are you?",
      },
      {
        id: 2,
        user: "Bob",
        content:
          "I'm good, thanks! Just working on a new project that involves React Virtuoso. It's really cool!",
      },
      {
        id: 3,
        user: "Alice",
        content:
          "Oh nice! I heard Virtuoso is great for handling large lists efficiently. Are you building a chat app?",
      },
      {
        id: 4,
        user: "Bob",
        content:
          "Yes! It's a dynamic chat interface. Users can scroll up to load older messages. Each message may have variable heights, images, or even long text paragraphs. Here's an example of a longer message to test scrolling behavior in Virtuoso:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
      },
      {
        id: 5,
        user: "Alice",
        content:
          "Wow, that’s quite long! This should test the variable height rendering nicely.",
      },
      {
        id: 6,
        user: "Bob",
        content: "Exactly. Also, some messages might be very short.",
      },
      {
        id: 7,
        user: "Alice",
        content: "👍",
      },
      {
        id: 8,
        user: "Bob",
        content:
          "Here’s a medium-length message to fill the chat and test smooth scrolling and virtualization behavior in the app.",
      },
      {
        id: 9,
        user: "Alice",
        content:
          "Great! This should cover short, medium, and long messages for testing.",
      },
      {
        id: 10,
        user: "Bob",
        content:
          "Finally, a very long message to really stress test the scroll behavior. Imagine this goes on and on, with multiple paragraphs, emojis, code snippets, or anything else a user might send in a real chat scenario.\n\n1. Bullet point one\n2. Bullet point two\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    ]);

    const handleMessageSend = () => {};
    return (
      <div
        ref={ref}
        className="absolute bottom-0 right-0 m-8 py-2 flex flex-col gap-1.5 min-h-7 w-80 h-100 items-center justify-center rounded-xl z-30 bg-light_sky_blue shadow-primary outline-primary border border-personal"
      >
        <div className="w-full h-full relative">
          <Virtuoso
            className={`w-full !h-86 rounded-md bg-light_sky_blue-700 border-personal `}
            data={messages}
            skipAnimationFrameInResizeObserver={true}
            initialTopMostItemIndex={messages.length - 1}
            itemContent={(index, message) => (
              <MessageBubble index={index} message={message} />
            )}
          ></Virtuoso>
        </div>

        <div
          draggable={false}
          className="px-2 reltative flex w-full gap-1.5 mt-auto items-center justify-center overflow-visible"
        >
          <div
            onMouseEnter={() => setPlaceholder("Ask AI for help!")}
            onMouseLeave={() => setPlaceholder("Say hello to chat!")}
            className="absolute left-3 outline-personal w-6 h-6 rounded-full cursor-pointer p-1 hover:bg-light_sky_blue"
          >
            <IconSlash size={15} />
          </div>
          <input
            placeholder={placeholder}
            className="font-[google_sans_code] placeholder:text-xs text-sm min-w-40 max-w-200 h-8 flex-1 rounded-2xl bg-light_sky_blue-700 mr-0 py-4 pr-1.5 pl-9 outline-personal "
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
