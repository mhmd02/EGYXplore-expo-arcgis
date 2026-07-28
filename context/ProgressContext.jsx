import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { useUser } from "./UserContext";
import { API_BASE_URL } from "../api/api";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { token, isLoading: userLoading } = useUser();
  const [completedIds, setCompletedIds] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemedIds, setRedeemedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCompleted = (id) => completedIds.includes(id);

  const fetchCompleted = useCallback(async () => {
    if (!token) {
      setCompletedIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/MobileMission/MyCompleted`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch completed missions: ${response.status}`,
        );
      }
      const data = await response.json();
      setCompletedIds(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchBalance = useCallback(async () => {
    if (!token) {
      setTotalPoints(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/MobileMission/MyBalance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch Your balance: ${response.status}`);
      }
      const data = await response.json();
      setTotalPoints(data.totalBalance);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    if (userLoading) return;
    fetchCompleted();
    fetchBalance();
  }, [token, userLoading, fetchCompleted, fetchBalance]);
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
    const result = await response.json();
    setCompletedIds((prev) => [...prev, missionId]);
    setTotalPoints((prev) => prev + (result.pointsEarned ?? 0));
    return result;
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
        loading,
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
