import axios from "axios";

/**
 * Uses Vite proxy to avoid CORS.
 * Base URL will be proxied via vite.config.ts like:
 *   /api → https://speechanalyticswebapi-cgcxa9hjevatbsc5.eastus2-01.azurewebsites.net
 */

export const testAllApis = async (token: string) => {
  try {
    const client = axios.create({
      baseURL: "/api",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 1. GET /api/Config/clients
    const clientsRes = await client.get("/Config/clients");
    const clients = clientsRes.data;

    console.log("✅ CLIENTS", clients);

    const clientId = clients[0]?.id;

    if (!clientId) {
      console.warn("❌ No valid client_id available");

      return;
    }

    // 2. GET /api/Config/interaction_status/{clientId}
    const statusRes = await client.get(
      `/Config/interaction_status/${clientId}`,
    );
    const statuses = statusRes.data;

    console.log("✅ INTERACTION STATUS", statuses);

    // 3. GET /api/Config/interaction_tags/{clientId}
    const tagsRes = await client.get(`/Config/interaction_tags/${clientId}`);
    const tags = tagsRes.data;

    console.log("✅ INTERACTION TAGS", tags);

    // 4. POST /api/Audio/interactions/filter
    const filterPayload = {
      client_id: clientId,
      start_date: "2025-01-01T00:00:00Z", // optional
      end_date: new Date().toISOString(), // optional
      status_ids: statuses.map((s: any) => s.id), // optional
      tag_ids: tags.map((t: any) => t.id), // optional
    };

    const filterRes = await client.post(
      "/Audio/interactions/filter",
      filterPayload,
    );

    console.log("✅ FILTERED INTERACTIONS", filterRes.data);

    // 5. GET /api/Audio/audio-details/{clientId}/{interactionId}
    const firstInteraction = filterRes.data[0];

    if (firstInteraction) {
      const detailsRes = await client.get(
        `/Audio/audio-details/${clientId}/${firstInteraction.id}`,
      );

      console.log("✅ AUDIO DETAILS", detailsRes.data);
    }

    console.log("🎯 ALL DONE");
  } catch (err: any) {
    console.error("❌ API error:", err?.response?.data || err.message);
  }
};
