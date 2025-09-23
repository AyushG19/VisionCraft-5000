import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { HTTP_BE_URL } from "../config/index";

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
      const res = await axiosInstance.post("/auth/create-newTokens");
      const newToken = res.data; //make sure res has only string token not in aobject form
      localStorage.setItem("accessToken", newToken);
      originalReq.headers["Authorization"] = newToken;

      subscribersCallback(newToken);
      return axiosInstance(originalReq);
    } catch (err: any) {
      refreshSubscribers = [];
      localStorage.removeItem("accessToken");
      //log the user out here
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
export default axiosInstance;
