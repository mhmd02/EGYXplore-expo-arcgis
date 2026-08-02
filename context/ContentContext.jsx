import { useState, useEffect, createContext } from "react";
import { getMissions, getRewards, getDestinations } from "../api/contentApi";
import { useUser } from "../context/UserContext";
export const ContentContext = createContext();

export default function ContentProvider({ children }) {
  const [missions, setMissions] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [destinations, setDestinations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoading: userLoading } = useUser();

  const fetchData = async () => {
    if (!token) {
      setMissions(null);
      setRewards(null);
      setDestinations(null);
      setLoading(false);
      return;
    }
    setLoading(true);
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
      value={{
        missions,
        rewards,
        destinations,
        loading,
        error,
        refetch: fetchData,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
