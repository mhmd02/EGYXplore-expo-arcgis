import { API_BASE_URL } from "./api";

export const getMissions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileMission/AllMissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch missions: ${response.status}`);
  }
  return response.json();
};

export const getRewards = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileReward/AllRewards`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch rewards: ${response.status}`);
  }
  return response.json();
};

