import { File } from "expo-file-system";
import { API_BASE_URL, checkDeletedUser } from "./api";

export async function getProfile(token) {
  if (!token) {
    throw new Error("Please log in before loading your profile.");
  }

  const response = await fetch(`${API_BASE_URL}/MobileAccount/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await checkDeletedUser(response);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success || !result.user) {
    throw new Error(result.message || "Could not load your profile.");
  }

  return result.user;
}

export async function updateProfile(token, profile) {
  if (!token) {
    throw new Error("Please log in before updating your profile.");
  }

  const response = await fetch(`${API_BASE_URL}/MobileAccount/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: profile.firstName,
      lastName: profile.lastName,
      country: profile.country,
      interests: profile.interests ?? [],
    }),
  });
  await checkDeletedUser(response);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success || !result.user) {
    throw new Error(result.message || "Could not update your profile.");
  }

  return result.user;
}

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
  await checkDeletedUser(res);
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not upload profile picture.");
  }

  return result;
}
