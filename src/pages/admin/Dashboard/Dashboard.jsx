import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

const quickLinks = [
  {
    label: "Students",
    to: "/admin/students",
    description: "Create, edit, deactivate accounts",
  },
  {
    label: "Courses",
    to: "/admin/courses",
    description: "Manage courses (code, name, description)",
  },
  {
    label: "Exams",
    to: "/admin/exams",
    description: "Create exams, manage availability windows",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    students: null,
    courses: null,
    exams: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCounts() {
      setLoading(true);
      setError("");
      try {
        const [studentsRes, coursesRes, examsRes] = await Promise.all([
          authFetch("/students"),
          authFetch("/courses"),
          authFetch("/exams"),
        ]);

        const authFailure = [studentsRes, coursesRes, examsRes].find(
          (res) => res.status === 401 || res.status === 403
        );
        if (authFailure) {
          localStorage.removeItem("token");
          navigate(authFailure.status === 401 ? "/login" : "/student");
          return;
        }

        const [studentsData, coursesData, examsData] = await Promise.all([
          studentsRes.json().catch(() => null),
          coursesRes.json().catch(() => null),
          examsRes.json().catch(() => null),
        ]);

        if (!studentsRes.ok)
          throw new Error(studentsData?.message || "Failed to load students");
        if (!coursesRes.ok)
          throw new Error(coursesData?.message || "Failed to load courses");
        if (!examsRes.ok)
          throw new Error(examsData?.message || "Failed to load exams");

        setCounts({
          students: studentsData.filter((s) => s.active).length,
          courses: coursesData.length,
          exams: examsData.length,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCounts();
  }, [navigate]);

  const statCards = [
    {
      label: "Active students",
      value: counts.students,
      to: "/admin/students",
      accent: "bg-peach text-ink",
    },
    {
      label: "Courses",
      value: counts.courses,
      to: "/admin/courses",
      accent: "bg-mint text-green",
    },
    {
      label: "Exams",
      value: counts.exams,
      to: "/admin/exams",
      accent: "bg-butter text-amber",
    },
];

return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <h1 className="dashboard-title">
          Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Overview of the <span className="font-semibold">examhub</span> application
        </p>

        {error && (
          <div className="dashboard-error">
            <b className="dashboard-error-label">Error ·</b> {error}
          </div>
        )}

        <div className="dashboard-stats-grid">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="dashboard-card dashboard-stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="dashboard-stat-label">{card.label}</p>
                <span className={`dashboard-stat-badge ${card.accent}`}>
                    {loading ? "…" : card.value}
                </span>
              </div>
              <p className="dashboard-stat-value">
                {loading ? "—" : card.value}
              </p>
            </Link>
          ))}
        </div>

        <h2 className="dashboard-section-title">
          Quick links
        </h2>
        <div className="dashboard-links-grid">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="dashboard-card dashboard-quick-link"
            >
              <p className="dashboard-quick-link-title">{link.label}</p>
              <p className="dashboard-quick-link-desc">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
