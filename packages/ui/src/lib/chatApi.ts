import { axiosInstance } from "@repo/common/api";

export const fetchChat = async (roomId: string): Promise<any> => {
  try {
    const res = await axiosInstance.get("api/rooms/chat", {
      data: { roomId: roomId },
    });
    console.log("res chat: ", res);
    return res;
  } catch (error) {
    console.log("error in fetching chat");
    return error;
  }
};
