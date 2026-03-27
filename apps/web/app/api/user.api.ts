import { UserType } from "@repo/common";
import { axiosInstance } from "./axios";

export async function fetchUserInfo(userId: string): Promise<UserType> {
  const res = await axiosInstance.post("/api/user/get-user", { userId });
  return res.data;
}
