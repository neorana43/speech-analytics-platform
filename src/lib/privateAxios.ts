// src/lib/privateAxios.ts
import axios from "axios";

export const privateApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // No logging, no interceptors
});
