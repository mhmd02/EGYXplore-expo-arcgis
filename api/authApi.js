import { API_BASE_URL } from "./api";
import * as FileSystem from "expo-file-system/legacy";

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/MobileAccount/Register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Registration failed");
  }
  return result;
};

export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/MobileAccount/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Login failed");
  }
  return result;
};

export async function uploadAvatar(token, localFileUri) {
  if (!localFileUri) throw new Error("No file URI provided");
  const response = await FileSystem.uploadAsync(
    `${API_BASE_URL}/MobileAccount/UploadAvatar`,
    localFileUri, // Just pass the raw URI string here
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file", // The name of the field your backend expects
      mimeType: "image/jpeg",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // FileSystem.uploadAsync returns the body as a JSON string, so you must parse it
  if (response.status >= 200 && response.status < 300) {
    return JSON.parse(response.body);
  } else {
    console.log("=== SERVER UPLOAD ERROR ===");
    console.log("Status Code:", response.status);
    console.log("Server Message:", response.body);
    throw new Error("Upload failed");
  }
}
