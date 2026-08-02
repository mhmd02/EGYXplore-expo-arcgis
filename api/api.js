const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:5217";

const apiOrigin = configuredBaseUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export const API_BASE_URL = `${apiOrigin}/api`;
