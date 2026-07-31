import { File } from "expo-file-system";
import { API_BASE_URL } from "./api";

export async function uploadProfilePicture(token, imageUri) {
  if (!token) {
    throw new Error("Please log in before uploading a profile picture.");
  }
  if (!imageUri) {
    throw new Error("Please select a profile picture.");
  }

  const uriWithoutQuery = imageUri.split("?")[0];
  const selectedName = uriWithoutQuery.split("/").pop() || "profile.jpg";
  const extension = selectedName.includes(".")
    ? selectedName.split(".").pop().toLowerCase()
    : "jpg";
  const normalizedExtension = extension === "jpeg" ? "jpeg" : extension;
  const fileName = selectedName.includes(".")
    ? selectedName
    : `profile.${normalizedExtension}`;
  const mimeType =
    normalizedExtension === "png"
      ? "image/png"
      : normalizedExtension === "webp"
        ? "image/webp"
        : "image/jpeg";

  // Create a real File object — the old { uri, name, type } plain-object
  // hack is no longer supported in Expo SDK 57 / RN 0.86.
  const file = new File(imageUri);

  const formData = new FormData();
  formData.append("image", file, fileName);

  const response = await fetch(`${API_BASE_URL}/MobileAccount/ProfilePicture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not upload profile picture.");
  }

  return result;
}
