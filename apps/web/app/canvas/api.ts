import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { HTTP_BE_URL } from "../../config/index";
import { ShapeType } from "@repo/common/types";

let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];
const subscribersCallback = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
};

const axiosInstance = axios.create({
  baseURL: HTTP_BE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalReq._retry
    ) {
      return Promise.reject(error);
    }

    originalReq._retry = true;
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((newToken: string) => {
          originalReq.headers["Authorization"] = newToken;
          resolve(axiosInstance(originalReq));
        });
      });
    }
    isRefreshing = true;
    try {
      console.log("Refreshing");
      const res = await axiosInstance.post("api/auth/refresh-token");
      const newToken = res.data.token; //make sure res has only string token not in aobject form
      localStorage.setItem("token", newToken);
      originalReq.headers["Authorization"] = newToken;

      subscribersCallback(newToken);
      return axiosInstance(originalReq);
    } catch (err: any) {
      refreshSubscribers = [];
      localStorage.removeItem("token");
      //log the user out here
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

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
