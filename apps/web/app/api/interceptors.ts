import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axiosInstance from "./axios";
let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];
const subscribersCallback = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
};

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
