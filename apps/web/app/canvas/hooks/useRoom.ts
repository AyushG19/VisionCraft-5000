import { UserInfo, useSocketContext } from "@repo/hooks";
import { joinRoomService, leaveRoomService } from "app/services/canvas.service";
import { useState } from "react";
import { disconnect } from "process";
import { getUserColor } from "app/lib/color.helper";

const useRoom = () => {
  const { inRoom, setInRoom, roomInfo, setRoomInfo } = useSocketContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoomService(code);
      const UsersInfo: UserInfo[] = data.users.map((u) => ({
        userId: u.userId,
        name: u.name,
        color: getUserColor(u.userId),
        cursor: null,
      }));
      setRoomInfo({ roomId: data.roomId, slug: code, users: UsersInfo });
      setToken(data.token);

      console.log("From page handleJoinRoom: ", data);
    } catch (error) {
      console.error("error in join room");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const data = await leaveRoomService(roomInfo.roomId);
      setRoomInfo({ roomId: "", slug: "", users: [] });
      setToken("");
      disconnect();

      console.log("From page handleLeaveRoom: ", data);
    } catch (error) {
      console.error("error in leave room", error);
    }
  };

  const handleChatToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    inRoom,
    token,
    isOpen,
    setIsOpen,
    handleJoinRoom,
    handleLeaveRoom,
    handleChatToggle,
  };
};

export default useRoom;
