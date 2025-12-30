import axios from "axios";
import { HTTP_BE_URL } from "../../config/index";

const axiosInstance = axios.create({
  baseURL: HTTP_BE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
export default axiosInstance;
