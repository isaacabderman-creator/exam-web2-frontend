import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function RoleRoute({ role, children }) {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      {user && user.role !== role ? (
        <Navigate to={user.role === "admin" ? "/admin" : "/student/exams"} replace />
      ) : (
        children
      )}
    </ProtectedRoute>
  );
}
