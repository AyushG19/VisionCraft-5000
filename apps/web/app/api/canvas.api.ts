import { Room, JoinRoomResponseType } from "@repo/common";
import { axiosInstance } from "./axios";

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
