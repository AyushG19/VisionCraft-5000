"use client";
import { createContext, useContext, useState } from "react";

type SocketContextType = {
  inRoom: boolean;
  setInRoom: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  slug: string;
  setSlug: React.Dispatch<React.SetStateAction<string>>;
};
const SocketContext = createContext<SocketContextType | null>(null);
export function SocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [slug, setSlug] = useState("");
  return (
    <SocketContext.Provider
      value={{ inRoom, setInRoom, roomId, setRoomId, slug, setSlug }}
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
