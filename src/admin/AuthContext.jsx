import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as adminApi from "./adminApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", admin: null });

  useEffect(() => {
    let active = true;
    adminApi
      .getSession()
      .then(({ admin }) => active && setState({ status: "authed", admin }))
      .catch(() => active && setState({ status: "guest", admin: null }));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { admin } = await adminApi.login(email, password);
    setState({ status: "authed", admin });
    return admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } finally {
      setState({ status: "guest", admin: null });
    }
  }, []);

  /** Call when an admin request returns 401, e.g. after the session expires. */
  const expire = useCallback(() => setState({ status: "guest", admin: null }), []);

  const value = useMemo(() => ({ ...state, login, logout, expire }), [state, login, logout, expire]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
