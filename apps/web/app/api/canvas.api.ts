import { ShapeType } from "@repo/common/types";
import { axiosInstance } from "./axios";
import { JoinRoomResponseType } from "app/canvas/types";

export const joinRoom = async (
  roomCode: string
): Promise<JoinRoomResponseType> => {
  let data = {
    slug: roomCode,
  };
  const res = await axiosInstance.post<JoinRoomResponseType>(
    `/api/rooms/check-code`,
    data
  );
  return res.data;
};

export const createRoom = async (canvas: ShapeType[]): Promise<any> => {
  try {
    const data = {
      canvas: canvas,
    };
    const res = await axiosInstance.post("/api/rooms/create", data);
    return res;
  } catch (error) {
    return error;
  }
};
