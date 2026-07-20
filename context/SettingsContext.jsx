import { createContext, useState } from "react";
export const SettingsContext = createContext();

export default function SettingsProvider({ children }) {
  const [missionAlerts, setMissionAlerts] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);
  return (
    <SettingsContext.Provider
      value={{ missionAlerts, rewardAlerts, setMissionAlerts, setRewardAlerts }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
