import { API_BASE_URL, checkDeletedUser } from "./api";
import * as SecureStore from "expo-secure-store";

export async function verifyMissionPhotos(missionId, base64Images) {
  const storedToken = await SecureStore.getItemAsync("token");

  if (!storedToken) {
    throw new Error("You're not logged in. Please sign in and try again.");
  }

  const res = await fetch(
    `${API_BASE_URL}/MobileMission/${missionId}/verify-photos`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: base64Images }),
    },
  );
  await checkDeletedUser(res);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.log("verify-photos failed:", res.status, body);
    throw new Error(
      `Couldn't verify photos (status ${res.status}). Please try again.`,
    );
  }

  return res.json(); // { verified, results }
}
