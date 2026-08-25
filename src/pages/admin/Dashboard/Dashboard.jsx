import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
      accent: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Courses",
      value: counts.courses,
      to: "/admin/courses",
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Exams",
      value: counts.exams,
      to: "/admin/exams",
      accent: "bg-amber-50 text-amber-700",
    },
];

return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">
        Dashboard
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Overview of the <span className="font-semibold text-indigo-600">examhub</span> application
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="dashboard-stat-card bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${card.accent}`}>
                  {loading ? "…" : card.value}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? "—" : card.value}
            </p>
          </Link> 
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Quick links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="dashboard-quick-link bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition"
          >
            <p className="font-medium text-slate-800">{link.label}</p>
            <p className="text-sm text-slate-500 mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
