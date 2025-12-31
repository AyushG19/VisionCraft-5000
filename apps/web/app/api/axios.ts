import axios from "axios";
import { HTTP_BE_URL } from "../../config/index";

export const axiosInstance = axios.create({
  baseURL: HTTP_BE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
export const refreshInstance = axios.create({
  baseURL: HTTP_BE_URL,
  timeout: 8000,
  withCredentials: true,
});
