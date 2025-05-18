import axios from "axios";

/**
 * Uses Vite proxy to avoid CORS.
 * Base URL will be proxied via vite.config.ts like:
 *   /api → https://speechanalyticswebapi-cgcxa9hjevatbsc5.eastus2-01.azurewebsites.net
 */

export const testAllApis = async (token: string) => {
  try {
    // Set bearer token
    const client = axios.create({
      baseURL: "/api",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 1. GET /api/Config/clients
    const clients = await client.get("/Config/clients");

    console.log("✅ CLIENTS", clients.data);

    // 2. GET /api/Config/interaction_status
    const status = await client.get("/Config/interaction_status");

    console.log("✅ INTERACTION STATUS", status.data);

    // 3. GET /api/Config/interaction_tags
    const tags = await client.get("/Config/interaction_tags");

    console.log("✅ INTERACTION TAGS", tags.data);

    // 4. POST /api/Audio/interactions/filter
    const filterPayload = {};

    const filtered = await client.post(
      "/Audio/interactions/filter",
      filterPayload,
    );

    console.log("✅ FILTERED INTERACTIONS", filtered.data);

    // All results summary
    console.log("🎯 ALL DONE");
  } catch (err: any) {
    console.error("❌ API error:", err?.response?.data || err.message);
  }
};
