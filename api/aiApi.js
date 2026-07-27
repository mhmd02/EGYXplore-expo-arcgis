import * as SecureStore from "expo-secure-store";
import { File } from "expo-file-system";

let inMemoryToken = null;

export async function getToken() {
  if (inMemoryToken) return inMemoryToken;
  try {
    inMemoryToken = await SecureStore.getItemAsync("token");
  } catch {
    inMemoryToken = null;
  }
  return inMemoryToken;
}

export async function logout() {
  inMemoryToken = null;
  try {
    await SecureStore.deleteItemAsync("token");
  } catch {}
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || "Login failed");
  }

  const data = await res.json();
  inMemoryToken = data.token;
  try {
    await SecureStore.setItemAsync("token", data.token);
  } catch {}
  return data;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:5217";

export async function sendChatMessage(
  message,
  history = [],
  images = [],
  audioUri = null,
  chatSessionId = null,
) {
  const token = await getToken();
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  if (res.status === 401) {
    await logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(unreadable)");
    console.error(`[AiChat] ${res.status} ${res.statusText}:`, errorText);
    throw new Error(`[${res.status}] ${errorText || res.statusText}`);
  }

  return res.json();
}

export async function getHistory() {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/AiChat/GetHistory`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getHistorySession(id) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/AiChat/GetHistorySession?id=${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}
