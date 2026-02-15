import { DrawElement, Room } from "@repo/common";
import { axiosInstance } from "./axios";
import { JoinRoomResponseType } from "app/canvas/types";

export const joinRoom = async (
  roomCode: string,
): Promise<JoinRoomResponseType> => {
  const data = {
    slug: roomCode,
  };
  const res = await axiosInstance.post<JoinRoomResponseType>(
    `/api/rooms/check-code`,
    data,
  );
  return res.data;
};

export const createRoom = async (): Promise<Room> => {
  const res = await axiosInstance.post("/api/rooms/create");
  return res.data;
};

export const leaveRoom = async (roomId: string): Promise<any> => {
  const res = await axiosInstance.post("/api/rooms/leave", { roomId: roomId });
  return res.data;
};

export const fetchChart = async (command: string): Promise<{ res: string }> => {
  const data = {
    userCommand: command,
  };
  const res = await axiosInstance.post("/api/ai/draw", data);
  console.log(typeof res.data);
  return res.data;
};
