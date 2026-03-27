import { fetchUserInfo } from "app/api/user.api";

export async function getUserInfo(userId: string) {
  return await fetchUserInfo(userId);
}
