export const baseUrl =
  import.meta.env.MODE === "development" ? "" : import.meta.env.VITE_API_URL;

export const apiBaseUrl = `${baseUrl}/api`;
