import { useState, useEffect, createContext } from "react";
import { getMissions, getRewards, getDestinations } from "../api/contentApi";
import { useUser } from "../context/UserContext";
import { useNotificationHub } from "../context/useNotificationsHub";

export const ContentContext = createContext();

export default function ContentProvider({ children }) {
  const [missions, setMissions] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [destinations, setDestinations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoading: userLoading } = useUser();
  const [newMission, setNewMission] = useState(null);
  const [newReward, setNewReward] = useState(null);
  const [allowMissionsNotifications, setAllowMissionsNotifications] =
    useState(true);
  const [allowRewardsNotifications, setAllowRewardsNotifications] =
    useState(true);

  const fetchData = async ({ silent = false } = {}) => {
    if (!token) {
      setMissions(null);
      setRewards(null);
      setDestinations(null);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [missionsResult, rewardsResult, destinationsResult] =
        await Promise.allSettled([
          getMissions(token),
          getRewards(token),
          getDestinations(token),
        ]);
      if (missionsResult.status === "fulfilled") {
        setMissions(missionsResult.value);
      } else {
        console.log("Missions fetch failed:", missionsResult.reason);
        setMissions(null);
      }
      if (rewardsResult.status === "fulfilled") {
        setRewards(rewardsResult.value);
      } else {
        console.log("Rewards fetch failed:", rewardsResult.reason);
        setRewards(null);
      }
      if (destinationsResult.status === "fulfilled") {
        setDestinations(destinationsResult.value);
      } else {
        console.log("Destinations fetch failed:", destinationsResult.reason);
        setDestinations(null);
      }

      if (
        missionsResult.status === "rejected" &&
        rewardsResult.status === "rejected" &&
        destinationsResult.status === "rejected"
      ) {
        setError("Failed to load content.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }
    fetchData();
  }, [token, userLoading]);

  useNotificationHub(token, {
    
    MissionAdded: (mission) => {
      setMissions((prev) => (prev ? [...prev, mission] : [mission]));
      setNewMission(true);
    },
    MissionUpdated: (updatedMission) => {
      setMissions((prev) =>
        prev
          ? prev.map((m) => (m.id === updatedMission.id ? updatedMission : m))
          : [updatedMission],
      );
    },
    MissionDeleted: (id) => {
      setMissions((prev) => (prev ? prev.filter((m) => m.id !== id) : []));
    },
    RewardAdded: (reward) => {
      setRewards((prev) => (prev ? [...prev, reward] : [reward]));
      setNewReward(true);
    },
    RewardUpdated: (updatedReward) => {
      setRewards((prev) =>
        prev
          ? prev.map((r) => (r.id === updatedReward.id ? updatedReward : r))
          : [updatedReward],
      );
    },
    RewardDeleted: (id) => {
      setRewards((prev) => (prev ? prev.filter((m) => m.id !== id) : []));
    },
    onReconnected: () => fetchData({ silent: true }),
  });

  return (
    <ContentContext.Provider
      value={{
        missions,
        rewards,
        destinations,
        loading,
        error,
        refetch: fetchData,
        newMission,
        setNewMission,
        newReward,
        setNewReward,
        allowMissionsNotifications,
        setAllowMissionsNotifications,
        allowRewardsNotifications,
        setAllowRewardsNotifications,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
