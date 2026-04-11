import { newRoom, JoinRoomResponseType } from "@repo/common";
import { axiosInstance } from "./axios";
import { env } from "config";

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

export const createRoom = async (): Promise<newRoom> => {
  const res = await axiosInstance.post("/api/rooms/create");
  return res.data;
};

export const leaveRoom = async (roomId: string): Promise<any> => {
  const res = await axiosInstance.post("/api/rooms/leave", { roomId: roomId });
  return res.data;
};

export const uploadImg = async (formData: FormData) => {
  const res = await axiosInstance.post(
    `https://api.cloudinary.com/v1_1/${env.CLOUD_NAME}/image/upload`,
    formData,
    {
      // Authorization: {
      //   username: env.CLOUD_API_KEY,
      //   password: env.CLOUD_SECRET,
      // },
      // body: { file: formData },
      withCredentials: false,
      headers: {
        "Content-Type": undefined,
      },
    },
  );
  return res.data;
};
