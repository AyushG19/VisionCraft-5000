import { ShapeType } from "@repo/common/types";

export const fetchChat = () => {
  const token = localStorage.getItem("token");
  const res = fetch(HTTP_BE_URL, {
    method: "GET",

    headers: {
      authorization: "bearer" + " " + token,
    },
  });
};

export const joinRoom = async (roomCode: string): Promise<any> => {
  try {
    let data = {
      slug: roomCode,
    };
    const res = await axiosInstance.post(`/api/rooms/check-code`, data);
    localStorage.setItem("roomId", res.data.id);
    localStorage.setItem("slug", res.data.slug);
    return res;
  } catch (error) {
    return error;
  }
};

export const createRoom = async (canvas: ShapeType[]): Promise<any> => {
  try {
    const data = {
      canvas: canvas,
    };
    const res = await axiosInstance.post("/api/rooms/create", data);
    localStorage.setItem("roomId", res.data.id);
    return res;
  } catch (error) {
    return error;
  }
};

export const saveCanvasState = async (
  boardState: ShapeType[],
  roomId: string
) => {
  try {
    let data = {
      boardState: boardState,
    };
    console.log("saving");
    const res = await axiosInstance.post(
      `/api/rooms/save-canvas?roomId=${encodeURIComponent(roomId)}`,
      data
    );
    console.log("saved", res);
    return res;
  } catch (error) {
    return error;
  }
};

export const login = async () => {
  try {
    let data = {
      email: "ayush@gamil.com",
      password: "@Ayush1900",
    };
    console.log("loggin in");
    const res = await axiosInstance.post(`/api/auth/login`, data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.userId);
    localStorage.setItem("name", res.data.name);
    console.log("login res :", res);
    return res;
  } catch (error) {
    return error;
  }
};
