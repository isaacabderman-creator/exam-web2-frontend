import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return async function handleLogin(e, email, password) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
}
