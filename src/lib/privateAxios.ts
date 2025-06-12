// src/lib/privateAxios.ts
import axios from "axios";
import Cookies from "js-cookie";

import { apiBaseUrl } from "./config";

// Create a custom event for navigation
const createNavigationEvent = () => {
  const event = new CustomEvent("auth:redirect", {
    detail: { path: "/login" },
  });

  window.dispatchEvent(event);
};

export const privateApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add token to all requests
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token expiration
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the refresh token from cookies
        const refreshToken = Cookies.get("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh token endpoint
        const response = await privateApi.post("/Auth/refresh-token", null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { token } = response.data;

        // Store the new token
        localStorage.setItem("token", token);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return privateApi(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear everything and trigger navigation event
        localStorage.removeItem("token");
        Cookies.remove("refresh_token");
        createNavigationEvent();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
