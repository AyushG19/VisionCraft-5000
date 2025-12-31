import {
  LoginFormValues,
  SignupFormValues,
  User,
  UserType,
} from "@repo/common/types";
import { axiosInstance } from "./axios";

//no try cathc here

export async function loginApi(loginData: LoginFormValues): Promise<UserType> {
  const res = await axiosInstance.post("/api/auth/login", loginData);
  return res.data;
}

export async function signupApi(
  signupData: SignupFormValues
): Promise<UserType> {
  const res = await axiosInstance.post("/api/auth/signup", signupData);
  return res.data;
}
