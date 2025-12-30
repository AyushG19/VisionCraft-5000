import { LoginFormValues, User, UserType } from "@repo/common/types";
import { loginApi, signupApi } from "app/api/auth.api";
import { error } from "console";
import { promises } from "dns";

export const loginService = async (
  loginData: LoginFormValues
): Promise<UserType> => {
  const res = await loginApi(loginData);
  if (!res.data) throw { message: "Empty response from server" };
  const parsedData = User.safeParse(res.data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw { message: "Invalid login response from server" };
  }
  return res.data;
};
