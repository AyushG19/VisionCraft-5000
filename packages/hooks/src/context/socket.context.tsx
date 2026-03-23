"use client";
import React, { createContext, useContext, useRef, useState } from "react";
import { MemberCursor, RoomInfo } from "../types";

type SocketContextType = {
  inRoom: boolean;
  setInRoom: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  roomInfo: RoomInfo;
  setRoomInfo: React.Dispatch<React.SetStateAction<RoomInfo>>;
  memberCursor: React.RefObject<MemberCursor>;
};

const SocketContext = createContext<SocketContextType | null>(null);
export function SocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inRoom, setInRoom] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomId: "",
    slug: "",
    users: [],
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  const memberCursor = useRef<MemberCursor>(new Map());

  return (
    <SocketContext.Provider
      value={{
        inRoom,
        setInRoom,
        isOpen,
        setIsOpen,
        token,
        setToken,
        roomInfo,
        setRoomInfo,
        memberCursor,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("Error calling useSocketContext");
  return ctx;
}
