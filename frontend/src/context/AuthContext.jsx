import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/admin";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await adminApi.profile();
        setAdmin(data.admin);
      } catch {
        localStorage.removeItem("adminToken");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      login: async (email, password) => {
        const { data } = await adminApi.login({ email, password });
        localStorage.setItem("adminToken", data.token);
        setAdmin(data.admin);
      },
      logout: async () => {
        try {
          await adminApi.logout();
        } finally {
          localStorage.removeItem("adminToken");
          setAdmin(null);
        }
      }
    }),
    [admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};