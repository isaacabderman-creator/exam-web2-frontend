import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { landingPath } from "./landingPath.js";

export default function RoleRoute({ role, children }) {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      {user && user.role !== role ? (
        <Navigate to={landingPath(user)} replace />
      ) : (
        children
      )}
    </ProtectedRoute>
  );
}
