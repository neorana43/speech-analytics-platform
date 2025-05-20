import axios from "axios";

// Central axios instance with /api base (Vite proxy avoids CORS)
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Authenticated API service wrapper
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

    // ✅ GET /api/Config/interaction_status/{clientId}
    getInteractionStatus: async (clientId: number) => {
      const res = await api.get(
        `/Config/interaction_status/${clientId}`,
        authHeader,
      );

      return res.data;
    },

    // ✅ GET /api/Config/interaction_tags/{clientId}
    getInteractionTags: async (clientId: number) => {
      const res = await api.get(
        `/Config/interaction_tags/${clientId}`,
        authHeader,
      );

      return res.data;
    },

    // ✅ POST /api/Audio/interactions/filter
    filterInteractions: async (payload: {
      client_id: number;
      start_date?: string;
      end_date?: string;
      status_ids?: number[];
      tag_ids?: number[];
    }) => {
      const res = await api.post(
        "/Audio/interactions/filter",
        payload,
        authHeader,
      );

      return res.data;
    },

    // ✅ GET /api/Audio/audio-details/{clientId}/{interactionId}
    getAudioDetails: async (clientId: number, interactionId: number) => {
      const res = await api.get(
        `/Audio/audio-details/${clientId}/${interactionId}`,
        authHeader,
      );

      // Optional: verify SAS token or signed URL is present
      if (!res.data.audio_file_uri.includes("?")) {
        console.warn(
          "⚠️ The audio_file_uri is not a signed URL. You might hit CORS or access errors.",
        );
      }

      return res.data;
    },
  };
};
