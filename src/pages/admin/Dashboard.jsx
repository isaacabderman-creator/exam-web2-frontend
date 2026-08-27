import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudents } from "../../api/students.js";
import { getCourses } from "../../api/courses.js";
import { getExams } from "../../api/exams.js";

const quickLinks = [
  {
    label: "Étudiants",
    to: "/admin/students",
    description: "Créer, modifier, désactiver des comptes",
  },
  {
    label: "Cours",
    to: "/admin/courses",
    description: "Gérer les cours (code, nom, description)",
  },
  {
    label: "Examens",
    to: "/admin/exams",
    description: "Créer des examens, gérer les créneaux",
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
        const [students, courses, exams] = await Promise.all([
          getStudents(),
          getCourses(),
          getExams(),
        ]);
        setCounts({
          students: students.filter((s) => s.is_active).length,
          courses: courses.length,
          exams: exams.length,
        });
      } catch (err) {
        if (err.status === 401) {
          navigate("/login");
          return;
        }
        if (err.status === 403) {
          navigate("/student/exams");
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCounts();
  }, [navigate]);

  const statCards = [
    {
      label: "Étudiants actifs",
      value: counts.students,
      to: "/admin/students",
      accent: "bg-peach text-amber border border-amber",
    },
    {
      label: "Cours",
      value: counts.courses,
      to: "/admin/courses",
      accent: "bg-mint text-green border border-green",
    },
    {
      label: "Examens",
      value: counts.exams,
      to: "/admin/exams",
      accent: "bg-butter text-amber border border-amber",
    },
];

return (
    <div className="page">
      <div className="page-inner">
        <h1 className="page-title">
          Tableau de bord
        </h1>
        <p className="page-subtitle mb-6">
          Vue d'ensemble d'<span className="font-semibold">examhub</span>
        </p>

        {error && (
          <div className="error-banner mb-4">
            <b className="error-banner-label">Erreur ·</b> {error}
          </div>
        )}

        <div className="dashboard-stats-grid">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="card card-link"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="dashboard-stat-label">{card.label}</p>
                <span className={`badge-compact ${card.accent}`}>
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
          Accès rapides
        </h2>
        <div className="dashboard-links-grid">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card card-link dashboard-quick-link"
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
