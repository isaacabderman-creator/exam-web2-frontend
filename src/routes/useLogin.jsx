import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  async function handleLogin(e, email, password) {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/student/exams");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return { handleLogin, error };
}
