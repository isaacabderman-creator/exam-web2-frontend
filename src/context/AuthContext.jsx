import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

function readStoredUser() {
  const raw = localStorage.getItem("examhub_user");
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, password) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || "/api"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    let data = null;
    try { data = await res.json(); } catch { /* réponse vide */ }

    if (!res.ok) {
      throw new Error(data?.message || `Erreur ${res.status}`);
    }

    localStorage.setItem("examhub_token", data.token);
    localStorage.setItem("examhub_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("examhub_token");
    localStorage.removeItem("examhub_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}