import { createContext, useContext, useState } from "react";
import { USER } from "../constants/user";
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(USER);
  const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));
  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside a UserProvider");
  }
  return context;
}
