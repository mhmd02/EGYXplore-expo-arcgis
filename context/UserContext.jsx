import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";
import * as SecureStore from "expo-secure-store";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    setUser(result.user);
    setToken(result.token);
    await SecureStore.setItemAsync("token", result.token);
    await SecureStore.setItemAsync("user", JSON.stringify(result.user));
    return result;
  };

  const register = async (data) => {
    const result = await registerUser(data);
    setUser(result.user);
    setToken(result.token);
    await SecureStore.setItemAsync("token", result.token);
    await SecureStore.setItemAsync("user", JSON.stringify(result.user));
    return result;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }));
  return (
    <UserContext.Provider
      value={{ user, token, login, register, logout, updateUser, isLoading }}
    >
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
