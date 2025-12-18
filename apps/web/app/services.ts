import { login, signup, joinRoom, createRoom } from "@repo/common/api";
import {
  checkCodeResponse,
  LoginFormValues,
  loginResponse,
  RoomSchema,
  ShapeType,
  SignupFormValues,
  SignupResponse,
} from "@repo/common/types";
import axios from "axios";

export const loginService = async (
  formValues: LoginFormValues
): Promise<loginResponse | undefined> => {
  try {
    const res = await login(formValues);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.userId);
    localStorage.setItem("name", res.data.name);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
    }
  }
};

export const signupService = async (
  formValues: SignupFormValues
): Promise<SignupResponse | undefined> => {
  try {
    const res = await signup(formValues);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.userId);
    localStorage.setItem("name", res.data.name);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
    }
  }
};
export const createRoomService = async (
  canvas: ShapeType[]
): Promise<RoomSchema | undefined> => {
  try {
    const res = await createRoom(canvas);
    localStorage.setItem("roomId", res.data.id);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
    }
  }
};
export const joinRoomService = async (
  roomCode: string
): Promise<checkCodeResponse | undefined> => {
  try {
    const res = await joinRoom(roomCode);
    console.log("at joinroomservice", res.data);
    localStorage.setItem("roomId", res.data.id);
    localStorage.setItem("slug", res.data.slug);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
    }
  }
};
