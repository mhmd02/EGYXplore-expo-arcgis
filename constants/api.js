// Minimal API client for the Tourism backend (Tourist_Project_MVC).
//
// Backs the AI chat screen and, optionally, mobile login. Two endpoints:
//   POST /api/auth/login  -> { token, expiresAtUtc, email, roles }
//   POST /AiChat/Send      -> { reply, tripSaved, tripPlanId, tripPlanTitle }
//
// /AiChat/Send works ANONYMOUSLY — you can chat with no token at all. A token
// is only needed for the AI to *save* a trip (requires a signed-in "User").

// Set EXPO_PUBLIC_API_BASE in your .env file — no code change needed.
// See .env.example for the format.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:5217";

// --- Token storage -----------------------------------------------------------
// Kept in memory by default so this file has zero hard dependencies and never
// crashes on import. If you install @react-native-async-storage/async-storage,
// the token is also persisted across app restarts automatically — no code
// change needed here.
const TOKEN_KEY = "auth_token";
let inMemoryToken = null;

// Lazily grab AsyncStorage only if it's actually installed. Returns null
// otherwise, in which case we fall back to the in-memory token.
function getAsyncStorage() {
  try {
    // eslint-disable-next-line global-require
    return require("@react-native-async-storage/async-storage").default;
  } catch {
    return null;
  }
}

async function saveToken(token) {
  inMemoryToken = token;
  const storage = getAsyncStorage();
  if (storage) {
    try {
      await storage.setItem(TOKEN_KEY, token);
    } catch {
      // Persistence is best-effort; the in-memory copy still works this session.
    }
  }
}

export async function getToken() {
  if (inMemoryToken) return inMemoryToken;
  const storage = getAsyncStorage();
  if (storage) {
    try {
      inMemoryToken = await storage.getItem(TOKEN_KEY);
    } catch {
      inMemoryToken = null;
    }
  }
  return inMemoryToken;
}

export async function logout() {
  inMemoryToken = null;
  const storage = getAsyncStorage();
  if (storage) {
    try {
      await storage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore — clearing the in-memory copy is what matters for this session.
    }
  }
}

// --- Auth --------------------------------------------------------------------
// Returns { token, expiresAtUtc, email, roles }. Only needed if you want the
// AI to save trips; anonymous chat doesn't require this.
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // prevents ngrok interstitial page
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || "Login failed");
  }

  const data = await res.json(); // { token, expiresAtUtc, email, roles }
  await saveToken(data.token);
  return data;
}

// --- AI chat -----------------------------------------------------------------
// message: the new user message (string).
// history: prior turns of THIS conversation, EXCLUDING the new message — an
//          array of { role: "user" | "assistant", content: string }. The
//          backend expects the new message separately in `message`, so don't
//          include it in history. Keep it short (the web widget caps at ~12).
// Returns { reply, tripSaved, tripPlanId, tripPlanTitle }.
export async function sendChatMessage(message, history = []) {
  const token = await getToken();

  const res = await fetch(`${API_BASE}/AiChat/Send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // prevents ngrok interstitial page
      // Omit the header entirely when anonymous — chat still works.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });

  if (res.status === 401) {
    // Token expired or invalid — clear it and ask the user to log in again.
    await logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[AiChat] ${res.status} ${res.statusText}:`, body);
    throw new Error(`[${res.status}] ${body || res.statusText}`);
  }

  return res.json(); // { reply, tripSaved, tripPlanId, tripPlanTitle }
}

export { API_BASE };
