import axios from "axios";
import { getAccessToken } from "../session/tokenManager";

const api = axios.create({
  baseURL: "https://api.bobros.co.in", // hardcoded base url
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
