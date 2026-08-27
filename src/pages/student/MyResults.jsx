import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResults } from "../../api/myExams.js";
import { formatDate } from "../../utils/formatDate.js";

export default function MyResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function handleAuthError(err) {
        if (err.status === 401) {
            navigate("/login");
            return true;
        }
        if (err.status === 403) {
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
                const data = await getMyResults();
                setResults(data);
            } catch (err) {
                if (!handleAuthError(err)) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }
        loadResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="page">
            <div className="page-inner">
                <h1 className="page-title">My results</h1>
                <p className="page-subtitle mb-6">
                    History of exams you have taken on{" "}
                    <span className="page-brand">examhub</span>
                </p>

                {error && (
                    <div className="error-banner mb-4">
                        <span className="error-banner-label">Error.</span> {error}
                    </div>
                )}

                {loading ? (
                    <p className="empty-text">Loading...</p>
                ) : results.length === 0 ? (
                    <div className="card empty-card">
                        <p className="empty-text">You haven't taken any exam yet.</p>
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
                                        <span className="badge-compact badge-course">
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
