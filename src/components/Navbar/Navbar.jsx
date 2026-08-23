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
        <span className="badge admin">{user.role === "admin" ? "Admin" : "Student"}</span>

        <nav className="pill-nav">
          {user.role === "admin" ? (
            <>
              <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
                Dashboard
              </Link>
              <Link to="/admin/students" className={isActive("/admin/students") ? "active" : ""}>
                Students
              </Link>
              <Link to="/admin/courses" className={isActive("/admin/courses") ? "active" : ""}>
                Courses
              </Link>
              <Link to="/admin/exams" className={isActive("/admin/exams") ? "active" : ""}>
                Exams
              </Link>
            </>
          ) : (
            <>
              <Link to="/student" className={isActive("/student") ? "active" : ""}>
                  Available Exams
              </Link>
              <Link to="/student/results" className={isActive("/student/results") ? "active" : ""}>
                  My results
              </Link>
            </>
          )}
        </nav>

        <span className="spacer">
          <span className="user">{user.name}</span>
          <span className="avatar" />
          <button onClick={handleLogout} className="btn quiet sm">Déconnexion</button>
        </span>
      </div>
    </div>
  );
}
