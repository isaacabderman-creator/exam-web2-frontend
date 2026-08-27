import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyResults.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

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

function formatDate(dateString) {
    return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MyResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function handleAuthError(status) {
        if (status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return true;
        }
        if (status === 403) {
            navigate("/admin");
            return true;
        }
        return false;
    }

    useEffect(() => {
        async function loadResults() {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch("/my/results");
                if (handleAuthError(res.status)) return;
                const data = await res.json().catch(() => null);
                if (!res.ok)
                    throw new Error(data?.message || "Failed to load results");
                setResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="results-page">
            <div className="results-page-inner">
                <h1 className="results-title">My results</h1>
                <p className="results-subtitle">
                    History of exams you have taken on{" "}
                    <span className="results-brand">examhub</span>
                </p>

                {error && (
                    <div className="results-error">
                        <span className="results-error-label">Error.</span> {error}
                    </div>
                )}

                {loading ? (
                    <p className="results-empty">Loading...</p>
                ) : results.length === 0 ? (
                    <div className="results-empty-card">
                        <p className="results-empty">You haven't taken any exam yet.</p>
                    </div>
                ) : (
                    <div className="results-list">
                        {results.map((result) => {
                            const percentage =
                                result.total_points > 0
                                    ? Math.round((result.score / result.total_points) * 100)
                                    : 0;
                            return (
                                <div key={result.exam_id} className="result-row">
                                    <div className="result-row-info">
                                        <span className="result-badge-course">
                                            {result.course_code}
                                        </span>
                                        <div>
                                            <p className="result-exam-title">{result.title}</p>
                                            <p className="result-exam-date">
                                                Taken on {formatDate(result.submitted_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="result-row-score">
                                        <p className="result-score-value">
                                            {result.score} / {result.total_points}
                                        </p>
                                        <p className="result-score-percent">{percentage}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
