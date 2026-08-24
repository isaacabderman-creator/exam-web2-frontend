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