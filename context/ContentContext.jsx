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
    if (!userLoading) {
      setMissions(null);
      setRewards(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [missionsData, rewardsData] = await Promise.all([
        getMissions(token),
        getRewards(token),
      ]);
      setMissions(missionsData);
      setRewards(rewardsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
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
