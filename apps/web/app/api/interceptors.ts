import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { axiosInstance, refreshInstance } from "./axios";
import { AppError } from "./error";
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
const subscribersCallback = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!error.response) {
      throw new AppError(
        "Network error.Please check internet connection.",
        "NETWORK_ERROR"
      );
    }

    const { status } = error.response;
    if (status === 401 && originalReq && !originalReq._retry) {
      if (originalReq.url?.includes("auth/refresh-token")) {
        throw new AppError("Session expired", "UNAUTHORIZED", 401);
      }
      originalReq._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            resolve(axiosInstance(originalReq));
          });
        });
      }

      isRefreshing = true;
      try {
        console.log("Refreshing");
        //clg
        await refreshInstance.post("api/auth/refresh-token");
        subscribersCallback();
        return axiosInstance(originalReq);
      } catch (err) {
        refreshSubscribers = [];
        //log the user out here
        throw new AppError(
          "Session expired. Please login again.",
          "UNAUTHORIZED",
          401
        );
      } finally {
        isRefreshing = false;
      }
    }
    switch (status) {
      case 400:
        throw new AppError("Invalid request", "VALIDATION_ERROR", 400);

      case 403:
        throw new AppError(
          "You do not have permission to perform this action.",
          "UNAUTHORIZED",
          403
        );

      case 500:
        throw new AppError(
          "Server error. Please try again later.",
          "SERVER_ERROR",
          500
        );

      default:
        throw new AppError(
          "Unexpected error occurred.",
          "UNKNOWN_ERROR",
          status
        );
    }
  }
);
