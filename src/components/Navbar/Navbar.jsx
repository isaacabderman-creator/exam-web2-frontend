import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css"; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="topbar-wrap">
      <div className="topbar">
        <span className="brand">examhub</span>
        <span className={`badge ${user.role === "admin" ? "admin" : "student"}`}>
          {user.role === "admin" ? "Admin" : "Étudiant"}
        </span>

        <nav className="pill-nav">
          {user.role === "admin" ? (
            <>
              <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
                Tableau de bord
              </Link>
              <Link to="/admin/students" className={isActive("/admin/students") ? "active" : ""}>
                Étudiants
              </Link>
              <Link to="/admin/courses" className={isActive("/admin/courses") ? "active" : ""}>
                Cours
              </Link>
              <Link to="/admin/exams" className={isActive("/admin/exams") ? "active" : ""}>
                Examens
              </Link>
            </>
          ) : (
            <>
              <Link to="/student" className={isActive("/student") ? "active" : ""}>
                  Examens disponibles
              </Link>
              <Link to="/student/results" className={isActive("/student/results") ? "active" : ""}>
                  Mes résultats
              </Link>
            </>
          )}
        </nav>

        <span className="spacer">
          <span className="user">{user.name}</span>
          <span className="avatar" />
          <button
            onClick={handleLogout}
            className="btn quiet sm"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </span>
      </div>
    </div>
  );
}
