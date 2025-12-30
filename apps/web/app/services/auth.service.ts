import { LoginFormValues, User, UserType } from "@repo/common/types";
import { loginApi, signupApi } from "app/api/auth.api";

export const loginService = async (
  loginData: LoginFormValues
): Promise<UserType> => {
  const res = await loginApi(loginData);
  if (!res.data) throw new Error("Empty response form server");
  const parsedData = User.safeParse(res.data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new Error("Invalid login response from server");
  }
  return res.data;
};
