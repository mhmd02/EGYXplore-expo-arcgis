import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { useUser } from "./UserContext";
import {
  completeMissionApi,
  getMyCompletedMissions,
  getMyBalance,
  redeemRewardApi,
  getMyRedeemedRewards,
} from "../api/progressApi";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { token, isLoading: userLoading } = useUser();
  const [completedIds, setCompletedIds] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemedIds, setRedeemedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isCompleted = (id) => completedIds.includes(id);

  const fetchCompleted = useCallback(async () => {
    if (!token) {
      setCompletedIds([]);
      return;
    }
    const data = await getMyCompletedMissions(token);
    setCompletedIds(data);
  }, [token]);

  const fetchBalance = useCallback(async () => {
    if (!token) {
      setTotalPoints(0);
      return;
    }
    const data = await getMyBalance(token);
    setTotalPoints(data.totalBalance);
  }, [token]);

  const fetchRedeemed = useCallback(async () => {
    if (!token) {
      setRedeemedIds([]);
      return;
    }
    const data = await getMyRedeemedRewards(token);
    setRedeemedIds(data);
  }, [token]);

  useEffect(() => {
    if (userLoading) return;
    if (!token) {
      setCompletedIds([]);
      setTotalPoints(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([fetchCompleted(), fetchBalance(), fetchRedeemed()])
      .catch((err) => {
        console.log(err);
        setError(err.message || "Failed to load your progress.");
      })
      .finally(() => setLoading(false));
  }, [token, userLoading, fetchCompleted, fetchBalance, fetchRedeemed]);

  const completeMission = async (missionId) => {
    const result = await completeMissionApi(token, missionId);
    setCompletedIds((prev) => [...prev, missionId]);
    setTotalPoints((prev) => prev + (result.pointsEarned ?? 0));
    return result;
  };

  const redeemReward = async (rewardId) => {
    const result = await redeemRewardApi(token, rewardId);
    setRedeemedIds((prev) => [...prev, rewardId]);
    setTotalPoints(result.remainingPoints);
    return result;
  };

  const isRedeemed = (id) => redeemedIds.includes(id);

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
        error,
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
