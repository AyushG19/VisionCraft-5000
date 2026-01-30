import {
  LoginFormValues,
  SignupFormValues,
  User,
  UserType,
} from "@repo/common";
import { loginApi, signupApi } from "app/api/auth.api";
import { AppError } from "app/api/error";

export const loginService = async (
  loginData: LoginFormValues,
): Promise<UserType> => {
  const data = await loginApi(loginData);
  console.log(data);
  const parsedData = User.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new AppError("Invalid login response from server", "SERVER_ERROR");
  }
  return parsedData.data;
};

export const signupService = async (
  signupData: SignupFormValues,
): Promise<UserType> => {
  const data = await signupApi(signupData);
  const parsedData = User.safeParse(data);
  if (!parsedData.success) {
    console.error(parsedData.error);
    throw new AppError("Invalid Response from server", "SERVER_ERROR");
  }
  return parsedData.data;
};
