import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const [counts, setCounts] = useState({
    students: null,
    courses: null,
    exams: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    setLoading(true);
    setError("");
    try {
      const [studentsRes, coursesRes, examsRes] = await Promise.all([
        authFetch("/students"),
        authFetch("/courses"),
        authFetch("/exams"),
      ]);
      
      const [studentsData, coursesData, examsData] = await Promise.all([
        studentsRes.json(),
        coursesRes.json(),
        examsRes.json(),
      ]);

      if (!studentsRes.ok)
        throw new Error(studentsData.message || "Failed to load students");
      if (!coursesRes.ok)
        throw new Error(coursesData.message || "Failed to load courses");
      if (!examsRes.ok)
        throw new Error(examsData.message || "Failed to load exams");

      setCounts({
        students: studentsData.filter((s) => s.actif).length,
        courses: coursesData.length,
        exams: examsData.length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }