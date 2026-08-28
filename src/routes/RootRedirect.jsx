import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";
import { landingPath } from "./landingPath.js";

export default function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={landingPath(user)} replace />;
}
