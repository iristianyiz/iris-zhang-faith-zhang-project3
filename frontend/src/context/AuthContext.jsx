import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.isLoggedIn();
      if (data && typeof data.username === "string") {
        setUsername(data.username);
      } else {
        setUsername(null);
      }
    } catch {
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Session may already be invalid; cookie clear is best-effort server-side.
    }
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({
      username,
      loading,
      isLoggedIn: Boolean(username),
      refresh,
      logout,
    }),
    [username, loading, refresh, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
