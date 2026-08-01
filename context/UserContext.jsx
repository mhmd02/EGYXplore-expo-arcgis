import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";
import * as SecureStore from "expo-secure-store";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedToken && storedUser) {
          const restoredUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(restoredUser);
          userRef.current = restoredUser;
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
    userRef.current = result.user;
    setUser(result.user);
    setToken(result.token);
    await SecureStore.setItemAsync("token", result.token);
    await SecureStore.setItemAsync("user", JSON.stringify(result.user));
    return result;
  };

  const register = async (data) => {
    const result = await registerUser(data);
    userRef.current = result.user;
    setUser(result.user);
    setToken(result.token);
    await SecureStore.setItemAsync("token", result.token);
    await SecureStore.setItemAsync("user", JSON.stringify(result.user));
    return result;
  };

  const logout = async () => {
    userRef.current = null;
    setUser(null);
    setToken(null);
    setIsLoading(false);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("profileImage");
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
