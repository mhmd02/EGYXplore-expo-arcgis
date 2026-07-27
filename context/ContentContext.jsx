import { useState, useEffect, createContext } from "react";
import { getMissions, getRewards } from "../api/contentApi";
import { useUser } from "../context/UserContext";
export const ContentContext = createContext();

export default function ContentProvider({ children }) {
  const [missions, setMissions] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoading: userLoading } = useUser();

  const fetchData = async () => {
    if (!token) {
      setMissions(null);
      setRewards(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [missionsResult, rewardsResult] = await Promise.allSettled([
        getMissions(token),
        getRewards(token),
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
        console.log("Missions fetch failed:", rewardsResult.reason);
        setRewards(null);
      }

      if (
        missionsResult.status === "rejected" &&
        rewardsResult.status === "rejected"
      ) {
        setError("Failed to load content.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }
    fetchData();
  }, [token, userLoading]);

  return (
    <ContentContext.Provider
      value={{ missions, rewards, loading, error, refetch: fetchData }}
    >
      {children}
    </ContentContext.Provider>
  );
}
