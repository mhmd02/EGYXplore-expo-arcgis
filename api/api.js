const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:5217";

const apiOrigin = configuredBaseUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
export const API_BASE_URL = `${apiOrigin}/api`;
export const HUB_BASE_URL = `${apiOrigin}/notificationHub`;
export const checkDeletedUser = async (response) => {
  if (response.status === 401) {
    const errorResult = await response.json();
    throw new Error(errorResult.message || "Session expired or user deleted.");
  }
};
