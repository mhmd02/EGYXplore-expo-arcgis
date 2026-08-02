import { API_BASE_URL } from "./api";

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
