import axios from "axios";
import { env } from "../../config";

export const axiosInstance = axios.create({
  baseURL: env.HTTP_BACKEND_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
export const refreshInstance = axios.create({
  baseURL: env.HTTP_BACKEND_URL,
  timeout: 8000,
  withCredentials: true,
});
