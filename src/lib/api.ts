import axios from "axios";

// Central axios instance with /api base (Vite proxy avoids CORS)
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Accept token for each call
export const ApiService = (token: string) => {
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return {
    // ✅ GET /api/Config/clients
    getClients: async () => {
      const res = await api.get("/Config/clients", authHeader);

      return res.data;
    },

    // ✅ GET /api/Config/interaction_status
    getInteractionStatus: async () => {
      const res = await api.get("/Config/interaction_status", authHeader);

      return res.data;
    },

    // ✅ GET /api/Config/interaction_tags
    getInteractionTags: async () => {
      const res = await api.get("/Config/interaction_tags", authHeader);

      return res.data;
    },

    // ✅ POST /api/Audio/interactions/filter
    filterInteractions: async (filterPayload: {}) => {
      const res = await api.post(
        "/Audio/interactions/filter",
        filterPayload,
        authHeader,
      );

      return res.data;
    },
  };
};
