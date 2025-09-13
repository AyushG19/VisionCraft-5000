import React, { useRef } from "react";
import ResizableDiv from "./ui/ResizableDiv";
import ChatModal from "./ChatModal";

const ChatBoxContainer = () => {
  const childRef = useRef<HTMLDivElement | null>(null);
  return (
    <ResizableDiv left top pos={{ bottom: 24, right: 24 }} childRef={childRef}>
      <ChatModal ref={childRef} />
    </ResizableDiv>
  );
};

export default ChatBoxContainer;
