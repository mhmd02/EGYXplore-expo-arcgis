import { API_BASE_URL } from "./api";

export const getMyCompletedMissions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileMission/MyCompleted`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch completed missions: ${response.status}`);
  }
  return response.json();
};

export const getMyBalance = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileMission/MyBalance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch your balance: ${response.status}`);
  }
  return response.json();
};

export const completeMissionApi = async (
  token,
  missionId,
  verificationPayload,
  verificationToken,
) => {
  const response = await fetch(`${API_BASE_URL}/MobileMission/Complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ missionId, verificationPayload, verificationToken }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to complete mission: ${response.status}`,
    );
  }
  return response.json();
};

export const redeemRewardApi = async (token, rewardId) => {
  const response = await fetch(`${API_BASE_URL}/MobileReward/Redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rewardId }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to redeem reward: ${response.status}`,
    );
  }
  return response.json();
};

export const getMyRedeemedRewards = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileReward/MyRedeemed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch redeemed rewards: ${response.status}`);
  }
  return response.json();
};
