import { createContext, useContext, useState } from "react";
import { useUser } from "./UserContext";
import { API_BASE_URL } from "../api/api";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [completedIds, setCompletedIds] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemedIds, setRedeemedIds] = useState([]);
  const { token } = useUser();
  const isCompleted = (id) => completedIds.includes(id);

  // Single award choke-point. Idempotent: a mission can only pay out once.
  const completeMission = async (missionId) => {
    const response = await fetch(`${API_BASE_URL}/MobileMission/Complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ missionId }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.message || `Failed to complete mission: ${response.status}`,
      );
    }
    setCompletedIds((prev) => [...prev, missionId]);
    return response.json();
  };

  const isRedeemed = (id) => redeemedIds.includes(id);

  // Single spend choke-point. Guards: enough points + not already redeemed.
  // Returns true on success, false if it couldn't be redeemed.
  const redeemReward = (reward) => {
    if (!reward || redeemedIds.includes(reward.id)) return false;
    if (totalPoints < reward.points) return false;

    setRedeemedIds((prev) => [...prev, reward.id]);
    setTotalPoints((prev) => prev - reward.points);
    return true;
  };

  return (
    <ProgressContext.Provider
      value={{
        completedIds,
        totalPoints,
        isCompleted,
        completeMission,
        redeemedIds,
        isRedeemed,
        redeemReward,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside a ProgressProvider");
  }
  return context;
}
