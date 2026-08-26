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

    return (
        <div className="exams-page">
            <div className="exams-inner">
                <h1 className="exams-title">Available exams</h1>
                <p className="exams-subtitle">
                    View and take your exams on{" "}
                    <span className="exams-brand">examhub</span>
                </p>

                {error && (
                    <div className="exams-error">
                        <span className="exams-error-label">Error.</span> {error}
                    </div>
                )}
                {loading ? (
                    <p className="exams-empty">Loading...</p>
                ) : exams.length === 0 ? (
                    <div className="exams-empty-card">
                        <p className="exams-empty">No exams available right now.</p>
                    </div>
                ) : (

            </div>
        </div>
    )
}