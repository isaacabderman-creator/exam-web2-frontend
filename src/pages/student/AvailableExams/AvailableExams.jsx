import { useEffect, useState }from "react";
import { Link } from "react-router-dom"; 
import "./AvailableExams.css";

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

function formatDatta(dateString) {
    return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AvailableExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadExams();
    }, []);

    async function loadExams() {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch("/my/exams");
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to load exams");
            setExams(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
}