// --- AI chat -----------------------------------------------------------------
// message: string text
// history: prior turns array
// images: array of image URI strings
// audioUri: audio file URI string
// Returns { reply, tripSaved, tripPlanId, tripPlanTitle }.
export async function sendChatMessage(
  message,
  history = [],
  images = [],
  audioUri = null,
) {
  const token = await getToken();
  const hasAttachments = images.length > 0 || !!audioUri;

  // Base headers shared across JSON and FormData requests
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let body;

  if (hasAttachments) {
    // 1. Build FormData for multipart upload
    const formData = new FormData();
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));

    // Append Images
    images.forEach((uri, index) => {
      const filename = uri.split("/").pop() || `image_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      formData.append("images", {
        uri,
        name: filename,
        type: mimeType,
      });
    });

    // Append Audio
    if (audioUri) {
      const filename = audioUri.split("/").pop() || "audio.m4a";
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : "m4a";
      const mimeType = ext === "m4a" ? "audio/x-m4a" : `audio/${ext}`;

      formData.append("audio", {
        uri: audioUri,
        name: filename,
        type: mimeType,
      });
    }

    body = formData;
    // NOTE: Do NOT set 'Content-Type': 'multipart/form-data' here!
    // Fetch automatically generates the boundary header for FormData.
  } else {
    // 2. Fall back to standard JSON payload when no attachments exist
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ message, history });
  }

  const res = await fetch(`${API_BASE}/AiChat/Send`, {
    method: "POST",
    headers,
    body,
  });

  if (res.status === 401) {
    // Token expired or invalid — clear it and ask the user to log in again.
    await logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "(unreadable)");
    console.error(`[AiChat] ${res.status} ${res.statusText}:`, errorText);
    throw new Error(`[${res.status}] ${errorText || res.statusText}`);
  }

  return res.json(); // { reply, tripSaved, tripPlanId, tripPlanTitle }
}