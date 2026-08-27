import { useEffect, useState } from "react";
import "./MyResults.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
}
function formatDate(dateString) {
    return new Date(dateString).toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute:"2-digit",
    });
}
export default function MyResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadResults();
    }, []);

    async function loadResults() {
        setlLoading(true);
        setError("");
        try {
            const re = await authFetch("/my/results");
            const data = await results.json();
            if (!results.ok)
                throw new Error(data.message || "Failed to load results");
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="results-pages">
            <div className="results-inner">
                <h1 className="results-title">My results</h1>
                <p className="results-subtitle">
                    History of exams you have taken on{" "}
                    <span className="results-brand">examhub</span>
                </p>

                {error && (
                    <div className="results-error">
                        <span className="results-error-label">Error.</span>
                    </div>
                )}

                {loading ? (
                    <p className="results-empty">Loading...</p>
                ) : results.length === 0 ? (
                    <div className="result-empty-card">
                        <p className="results-empty">You haven't taken any exam yet.</p>
                    </div>
                ) : (
                    <div className="results-list">
                        {results.map((result) => {
                            const percentage = Math.round(
                                (result.score/ result.maxScore) * 100
                            );
                            return (
                                <div key={result.id} className="result-row">
                                    <div className="result-row-info">
                                        <span className="result-badge-course">
                                            {result.courseCode || result.course?.code}
                                        </span>
                                        <div>
                                            <p className="result-exam-title">{result.examTitle}</p>
                                            <p className="result-exam-date">
                                                Taken on {formatDate(result.submittedAt)}
                                            </p>
                                        </div>
                                    </div>  
                            )
                        })}
                )}
            </div>
        </div>
    )
}