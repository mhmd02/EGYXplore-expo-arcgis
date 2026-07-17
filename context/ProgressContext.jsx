import { createContext, useContext, useState } from "react";

// Shared, cross-screen progress: mission completion + points + reward redemption.
// Lives above the router so progress survives navigation.
// NOTE: in-memory only for now — resets on app restart.
// TODO (later): persist to AsyncStorage so progress survives restarts,
//   and eventually replace completeMission/redeemReward bodies with server calls.
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [completedIds, setCompletedIds] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [redeemedIds, setRedeemedIds] = useState([]);

  const isCompleted = (id) => completedIds.includes(id);

  // Single award choke-point. Idempotent: a mission can only pay out once.
  const completeMission = (mission) => {
    if (!mission || completedIds.includes(mission.id)) return;

    setCompletedIds((prev) => [...prev, mission.id]);
    setTotalPoints((prev) => prev + mission.points);
  };

  const isRedeemed = (id) => redeemedIds.includes(id);

  // Single spend choke-point. Guards: enough points + not already redeemed.
  // Returns true on success, false if it couldn't be redeemed.
  const redeemReward = (reward) => {
    if (!reward || redeemedIds.includes(reward.id)) return false;
    if (totalPoints < reward.cost) return false;

    setRedeemedIds((prev) => [...prev, reward.id]);
    setTotalPoints((prev) => prev - reward.cost);
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