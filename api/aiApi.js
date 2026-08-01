import { File } from "expo-file-system";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:5217";

export class AiAuthenticationError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "AiAuthenticationError";
  }
}

function getAuthorizationHeaders(token) {
  if (!token) {
    throw new AiAuthenticationError("Please log in to use the AI assistant.");
  }

  return { Authorization: `Bearer ${token}` };
}

function throwIfUnauthorized(response) {
  if (response.status === 401) {
    throw new AiAuthenticationError();
  }
}

export async function sendChatMessage(
  token,
  message,
  history = [],
  images = [],
  audioUri = null,
  chatSessionId = null,
) {
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...getAuthorizationHeaders(token),
  };

  const formData = new FormData();
  formData.append("message", String(message || ""));
  formData.append("history", JSON.stringify(history));
  if (chatSessionId) {
    formData.append("chatSessionId", String(chatSessionId));
  }

  // Collect base64 strings — avoids all Android Blob/ArrayBuffer/data-URL issues.
  const imagesBase64 = [];
  const imagesMimeTypes = [];
  for (let i = 0; i < images.length; i++) {
    const uri = images[i];
    if (typeof uri !== "string") continue;
    const filename = uri.split("/").pop() || `image_${i}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const base64 = await new File(uri).base64();
    imagesBase64.push(base64);
    imagesMimeTypes.push(mimeType);
  }
  formData.append("imagesBase64", JSON.stringify(imagesBase64));
  formData.append("imagesMimeTypes", JSON.stringify(imagesMimeTypes));

  if (audioUri && typeof audioUri === "string") {
    const filename = audioUri.split("/").pop() || "audio.m4a";
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "m4a";
    const mimeType = ext === "m4a" ? "audio/x-m4a" : `audio/${ext}`;
    const base64 = await new File(audioUri).base64();
    formData.append("audioBase64", base64);
    formData.append("audioMimeType", mimeType);
  }

  const res = await fetch(`${API_BASE}/AiChat/Send`, {
    method: "POST",
    headers,
    body: formData,
  });

  throwIfUnauthorized(res);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(unreadable)");
    console.error(`[AiChat] ${res.status} ${res.statusText}:`, errorText);
    throw new Error(`[${res.status}] ${errorText || res.statusText}`);
  }

  return res.json();
}

export async function getHistory(token) {
  const res = await fetch(`${API_BASE}/AiChat/GetHistory`, {
    headers: {
      ...getAuthorizationHeaders(token),
    },
  });
  throwIfUnauthorized(res);
  if (!res.ok) {
    throw new Error(`Failed to load chat history: ${res.status}`);
  }
  return res.json();
}

export async function getHistorySession(token, id) {
  const res = await fetch(`${API_BASE}/AiChat/GetHistorySession?id=${id}`, {
    headers: {
      ...getAuthorizationHeaders(token),
    },
  });
  throwIfUnauthorized(res);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load chat session: ${res.status}`);
  }
  return res.json();
}
