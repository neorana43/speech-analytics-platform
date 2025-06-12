// src/lib/testApi.ts
import axios from "axios";

import { apiBaseUrl } from "./config";

export const testAllApis = async (token: string) => {
  try {
    const client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 1. Get Clients
    const clientsRes = await client.get("/Config/clients");
    const clients = clientsRes.data;

    console.log("✅ CLIENTS", clients);

    const clientId = clients[0]?.id;

    if (!clientId) {
      console.warn("❌ No client ID found");

      return;
    }

    // 2. Get Statuses
    const statusRes = await client.get(
      `/Config/interaction_status/${clientId}`,
    );
    const statuses = statusRes.data;

    console.log("✅ INTERACTION STATUS", statuses);

    // 3. Get Tags
    const tagsRes = await client.get(`/Config/interaction_tags/${clientId}`);
    const tags = tagsRes.data;

    console.log("✅ INTERACTION TAGS", tags);

    // 4. Filter Interactions
    const filterPayload = {
      client_id: clientId,
      start_date: "2025-01-01T00:00:00Z",
      end_date: new Date().toISOString(),
      status_ids: statuses.map((s: any) => s.id),
      tag_ids: tags.map((t: any) => t.id),
      page: 0,
      page_size: 10,
    };
    const filterRes = await client.post(
      "/Audio/interactions/filter",
      filterPayload,
    );
    const interactions = filterRes.data;

    console.log("✅ FILTERED INTERACTIONS", interactions);

    const firstInteraction = interactions[0];

    if (!firstInteraction) {
      console.warn("❌ No interactions found");

      return;
    }

    const interactionId = firstInteraction.id;

    // 5. Get Audio Details
    const detailsRes = await client.get(
      `/Audio/audio-details/${clientId}/${interactionId}`,
    );
    const audioDetails = detailsRes.data;

    console.log("✅ AUDIO DETAILS", audioDetails);

    const fileId = firstInteraction?.file_id || audioDetails?.file_id || 1;

    // 6. Get Audio Token
    const tokenRes = await client.get(`/Audio/audio-token/${fileId}`);
    const audioToken = tokenRes.data;

    console.log("✅ AUDIO TOKEN", audioToken);

    // 7. Audio Stream
    const streamRes = await client.get(`/Audio/audiocontent/${audioToken}`, {
      responseType: "blob",
    });

    console.log("✅ AUDIO STREAM", streamRes.data);

    // 8. Save Correction
    const saveCorrectionRes = await client.post("/Audio/save-correction", {
      id: 0,
      client_id: clientId,
      interaction_id: interactionId,
      original_text: "Original",
      corrected_text: "Corrected",
    });

    console.log("✅ SAVED CORRECTION", saveCorrectionRes.data);

    const savedCorrectionId = saveCorrectionRes.data?.id;

    if (savedCorrectionId) {
      // 9. Delete Correction
      const deleteCorrectionRes = await client.delete(
        `/Audio/delete-correction/${savedCorrectionId}`,
      );

      console.log("✅ DELETED CORRECTION", deleteCorrectionRes.data);
    }

    // 10. Get Prompts
    const promptRes = await client.get(
      `/Prompt/get_prompts?client_id=${clientId}`,
    );
    const prompts = promptRes.data;

    console.log("✅ PROMPTS", prompts);

    if (Array.isArray(prompts) && prompts.length > 0) {
      const promptId = prompts[0].prompt_id;

      // 11. Get Prompt Detail
      const detailRes = await client.get(
        `/Prompt/get_prompt_detail?prompt_id=${promptId}`,
      );
      const promptDetail = detailRes.data;

      console.log("✅ PROMPT DETAIL", promptDetail);

      // 12. Preview Prompt
      const previewPromptRes = await client.post("/Prompt/preview_prompt", {
        prompt_id: 1,
        client_id: 1,
        prompt: promptDetail.prompt || "Default preview prompt",
        is_active: promptDetail.is_active ?? true,
        prompt_title: promptDetail.prompt_title || "Default Title",
        ids_to_exclude: [],
        direction: "prev",
        questions: promptDetail.questions.map((q: any) => ({
          question_id: q.question_id,
          client_id: q.client_id,
          question: q.question,
          is_active: q.is_active,
          prompt_id: q.prompt_id,
          question_key: q.question_key,
          to_delete: q.to_delete,
        })),
      });

      const previewResults = previewPromptRes.data;

      console.log("✅ PREVIEW PROMPT RAW", previewResults);

      // Log the result in readable format
      previewResults.forEach((entry: any, index: number) => {
        console.log(
          `\n📞 Interaction #${index + 1} (ID: ${entry.interaction_id})`,
        );

        if (!Array.isArray(entry.json_result)) {
          console.warn("⚠️ No json_result found.");

          return;
        }

        // Map the json_result to include question_key from the original questions
        const mappedResults = entry.json_result.map((result: any) => {
          const originalQuestion = promptDetail.questions.find(
            (q: any) => q.question_id === result.question_id,
          );

          return {
            ...result,
            question_key: originalQuestion?.question_key || "Unknown",
          };
        });

        mappedResults.forEach((result: any) => {
          console.log(
            `📌 Question Key: ${result.question_key} | Answer: ${result.answer}`,
          );
        });
      });
    }

    // 13. Save Prompt Detail
    const savePromptRes = await client.post(
      "/Prompt/save_prompt_details",
      JSON.stringify({
        prompt_id: 1,
        client_id: clientId,
        prompt_title: "Test Prompt Title",
        prompt: "This is a sample prompt text.",
        is_active: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    console.log("✅ SAVED PROMPT", savePromptRes.data);

    // 14. Flag Segment
    const flagSegmentRes = await client.post(
      "/Audio/flag_segment?segment_id=1&flagged=true",
    );

    console.log("✅ FLAGGED SEGMENT", flagSegmentRes.data);

    // 15. Raw Audio Metadata
    const rawAudioRes = await client.get(`/Audio/audio/${fileId}`);

    console.log("✅ RAW AUDIO (METADATA)", rawAudioRes.data);

    console.log("🎯 ALL API TESTS COMPLETED SUCCESSFULLY");
  } catch (err: any) {
    console.error("❌ API error:", err?.response?.data || err.message);
  }
};
