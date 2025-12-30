import {
  LoginFormValues,
  SignupFormValues,
  User,
  UserType,
} from "@repo/common/types";
import axiosInstance from "./axios";
import { AxiosResponse } from "axios";

export async function loginApi(
  loginData: LoginFormValues
): Promise<AxiosResponse<UserType>> {
  return await axiosInstance.post("/api/auth/login", loginData);
}

export async function signupApi(signupData: SignupFormValues) {
  return axiosInstance.post<UserType>("/api/auth/signup", signupData);
}
