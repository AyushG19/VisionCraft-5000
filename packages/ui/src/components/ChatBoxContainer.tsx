"use client";
import React, { RefObject, useEffect, useRef, useState } from "react";
import ChatModal from "./ChatModal";
import { useFetchChat } from "@repo/common/api";

const ChatBoxContainer = ({
  wsRef,
}: {
  wsRef: RefObject<WebSocket | null>;
}) => {
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const fetchChatHistory = async () => {
    const roomId = localStorage.getItem("roomId");
    if (!roomId) {
      console.error("Room Id not found !");
      return;
    }
    const { data, isLoading } = useFetchChat(roomId);
    if (!data) return;
  };
  useEffect(() => {
    if (!wsRef.current) return;

    fetchChatHistory();
  }, []);

  const childRef = useRef<HTMLDivElement | null>(null);
  const chatModalProps = {
    chatVisible,
    wsRef,
    pastMessages: [],
  };
  return <ChatModal {...chatModalProps} ref={childRef} />;
};

export default ChatBoxContainer;
