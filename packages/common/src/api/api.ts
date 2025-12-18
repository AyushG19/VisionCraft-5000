import { AxiosError, AxiosResponse } from "axios";
import axiosInstance from "./axiosInstance";
import { LoginFormValues, ShapeType, SignupFormValues } from "../types";

export const login = async (data: LoginFormValues): Promise<AxiosResponse> => {
  try {
    console.log("loggin in");
    const res = await axiosInstance.post(`/api/auth/login`, data);
    console.log("login res :", res);
    return res;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  data: SignupFormValues
): Promise<AxiosResponse> => {
  try {
    console.log("signing in");
    const res = await axiosInstance.post(`/api/auth/signup`, data);
    console.log("signup res :", res);
    return res;
  } catch (error) {
    throw error;
  }
};

export const joinRoom = async (roomCode: string): Promise<AxiosResponse> => {
  try {
    let data = {
      slug: roomCode,
    };
    const res = await axiosInstance.post(`/api/rooms/check-code`, data);
    return res;
  } catch (error) {
    throw error;
  }
};

export const createRoom = async (
  canvas: ShapeType[]
): Promise<AxiosResponse> => {
  try {
    const data = {
      canvas: canvas,
    };
    const res = await axiosInstance.post("/api/rooms/create", data);
    return res;
  } catch (error) {
    throw error;
  }
};
