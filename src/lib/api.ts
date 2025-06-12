// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

import {
  ApiClientPayload,
  ResetPasswordPayload,
  ForgotPasswordPayload,
  UpdateProfileRequest,
} from "../types/api";

import { baseUrl, apiBaseUrl } from "./config";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (
      [401, 403].includes(error?.response?.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Get refresh token from cookie
        const refreshToken = Cookies.get("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh token endpoint
        const response = await api.post("/Auth/refresh-token", null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { token } = response.data;

        // Update token in localStorage
        localStorage.setItem("token", token);

        // Update the original request's authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear everything and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("selectedClient");
        Cookies.remove("refresh_token");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const ApiService = (token: string) => {
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return {
    // ───────── CONFIG ─────────
    getClients: async () =>
      api.get("/Config/clients", authHeader).then((res) => res.data),
    getInteractionStatus: async (clientId: number) =>
      api
        .get(`/Config/interaction_status/${clientId}`, authHeader)
        .then((res) => res.data),
    getInteractionTags: async (clientId: number) =>
      api
        .get(`/Config/interaction_tags/${clientId}`, authHeader)
        .then((res) => res.data),
    getMenu: async (clientId: number) =>
      api
        .get(`/Config/get_menu?client_id=${clientId}`, authHeader)
        .then((res) => res.data),
    getRoles: async () =>
      api.get("/Config/roles", authHeader).then((res) => res.data),

    // ───────── CLIENT ─────────
    getClient: async () =>
      api.get("/Client/get", authHeader).then((res) => res.data),
    saveClient: async (payload: ApiClientPayload) =>
      api.post("/Client/save", payload, authHeader).then((res) => res.data),
    setClientStatus: async (id: number, isActive: boolean) =>
      api
        .post(`/Client/set-status/${id}?isActive=${isActive}`, null, authHeader)
        .then((res) => res.data),

    // ───────── AUTH ─────────
    login: async (payload: { username: string; password: string }) =>
      api.post("/Auth/login", payload).then((res) => res.data),
    forgotPassword: async (payload: ForgotPasswordPayload) =>
      api.post("/Auth/forgot-password", payload).then((res) => res.data),
    resetPassword: async (payload: ResetPasswordPayload) =>
      api.post("/Auth/reset-password", payload).then((res) => res.data),
    refreshToken: async () =>
      api.post("/Auth/refresh-token", null, authHeader).then((res) => res.data),
    updateProfile: async (payload: UpdateProfileRequest) =>
      api
        .post("/Auth/update-profile", payload, authHeader)
        .then((res) => res.data),
    getMe: async () => api.get("/Auth/me", authHeader).then((res) => res.data),

    // ───────── USER ─────────
    getUsers: async () =>
      api.get("/User/list", authHeader).then((res) => res.data),
    getUser: async (userId: number) =>
      api
        .get(`/User/get_user?user_id=${userId}`, authHeader)
        .then((res) => res.data),
    saveUser: async (payload: {
      user_id: number;
      username: string;
      first_name: string;
      last_name: string;
      email: string;
      is_active: boolean;
      global_role_ids: number[];
      client_roles: {
        client_id: number;
        role_ids: number[];
      }[];
    }) => api.post("/User/save", payload, authHeader).then((res) => res.data),
    setUserActiveStatus: async (userId: number, isActive: boolean) =>
      api
        .post(
          `/User/set-active-status?userId=${userId}&isActive=${isActive}`,
          null,
          authHeader,
        )
        .then((res) => res.data),

    changePassword: async (userId: number, newPassword: string) =>
      api
        .post(
          `/User/change-password?userId=${userId}&newPassword=${newPassword}`,
          null,
          authHeader,
        )
        .then((res) => res.data),

    sendWelcomeEmail: async (userId: number) =>
      api
        .post(`/User/send-welcome-email?userId=${userId}`, null, authHeader)
        .then((res) => res.data),

    deleteUser: async (userId: number) =>
      api.delete(`/User/delete/${userId}`, authHeader).then((res) => res.data),

    // ───────── AUDIO ─────────
    filterInteractions: async (payload: any) =>
      api
        .post("/Audio/interactions/filter", payload, authHeader)
        .then((res) => res.data),
    getAudioDetails: async (clientId: number, interactionId: number) =>
      api
        .get(`/Audio/audio-details/${clientId}/${interactionId}`, authHeader)
        .then((res) => res.data),
    getAudioToken: async (fileId: number) =>
      api
        .get(`/Audio/audio-token/${fileId}`, authHeader)
        .then((res) =>
          typeof res.data === "string" ? res.data : res.data?.token,
        ),
    getAudioStreamUrlFromToken: (token: string) =>
      `${baseUrl}/api/Audio/audiocontent/${token}`,
    getAudioUrlWithHeader: (fileId: number) =>
      `${baseUrl}/api/Audio/audio/${fileId}`,

    saveCorrection: async (payload: any) =>
      api
        .post("/Audio/save-correction", payload, authHeader)
        .then((res) => res.data),
    deleteCorrection: async (correctionId: number) =>
      api
        .delete(`/Audio/delete-correction/${correctionId}`, authHeader)
        .then((res) => res.data),

    flagSegment: async (segmentId: number, flagged: boolean) =>
      api
        .post(
          `/Audio/flag_segment?segment_id=${segmentId}&flagged=${flagged}`,
          null,
          authHeader,
        )
        .then((res) => res.data),

    saveAccuracy: async (payload: {
      interaction_id: number;
      correction_word_count: number;
    }) =>
      api
        .post("/Audio/save-accuracy", payload, authHeader)
        .then((res) => res.data),

    // ───────── PROMPT ─────────
    getPrompts: async (clientId?: number) =>
      api
        .get(
          `/Prompt/get_prompts${clientId ? `?client_id=${clientId}` : ""}`,
          authHeader,
        )
        .then((res) => res.data),
    getPromptDetail: async (promptId: number) =>
      api
        .get(`/Prompt/get_prompt_detail?prompt_id=${promptId}`, authHeader)
        .then((res) => res.data),
    savePromptDetails: async (promptJson: string) => {
      try {
        const res = await api.post("/Prompt/save_prompt_details", promptJson, {
          ...authHeader,
          headers: {
            ...authHeader.headers,
            "Content-Type": "application/json",
          },
        });

        return res.data;
      } catch (error: any) {
        const apiError = error?.response?.data?.error;

        if (
          apiError ===
          "Duplicate question_key for the same client is not allowed."
        ) {
          const duplicateKey = error?.response?.data?.duplicate_key;
          const err = new Error("DUPLICATE_QUESTION_KEY");

          (err as any).duplicateKey = duplicateKey;
          throw err;
        }
        throw error;
      }
    },
    previewPrompt: async (payload: any) =>
      api
        .post("/Prompt/preview_prompt", payload, authHeader)
        .then((res) => res.data),
    deletePrompt: async (promptId: number) =>
      api
        .delete(`/Prompt/delete?prompt_id=${promptId}`, authHeader)
        .then((res) => res.data),
  };
};
