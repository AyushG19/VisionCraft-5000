"use client";
import React, { RefObject, useEffect, useRef, useState } from "react";
import ResizableDiv from "./ui/ResizableDiv";
import ChatModal from "./ChatModal";

const ChatBoxContainer = ({
  wsRef,
}: {
  wsRef: RefObject<WebSocket | null>;
}) => {
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  useEffect(() => {
    if (!childRef.current) return;
    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const h = entries[0].contentRect.height;
      setChatVisible(h > 40);
    });
    ro.observe(childRef.current);
    return () => ro.disconnect();
  }, []);

  const childRef = useRef<HTMLDivElement | null>(null);
  const chatModalProps = {
    chatVisible,
    wsRef,
  };
  return (
    <ResizableDiv left top pos={{ bottom: 24, right: 24 }} childRef={childRef}>
      <ChatModal {...chatModalProps} ref={childRef} />
    </ResizableDiv>
  );
};

export default ChatBoxContainer;
