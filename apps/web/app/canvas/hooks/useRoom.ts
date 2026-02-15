import { useSocketContext } from "@repo/hooks";
import { joinRoomService, leaveRoomService } from "app/services/canvas.service";
import { useState } from "react";
import { useCanvasSocket } from "./useCanvasSocket";

const useRoom = () => {
  const { inRoom, slug, roomId, setInRoom, setSlug, setRoomId } =
    useSocketContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoomService(code);
      setRoomId(data.roomId);
      setSlug(code);
      setToken(data.token);

      console.log("From page handleJoinRoom: ", data);
    } catch (error) {
      console.error("error in join room");
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      const data = await leaveRoomService(roomId);
      setInRoom(false);
      setRoomId("");
      setSlug("");
      setToken("");

      console.log("From page handleLeaveRoom: ", data);
    } catch (error) {
      console.error("error in join room");
    }
  };

  const handleChatToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    inRoom,
    roomId,
    slug,
    token,
    isOpen,
    setIsOpen,
    handleJoinRoom,
    handleLeaveRoom,
    handleChatToggle,
  };
};

export default useRoom;
