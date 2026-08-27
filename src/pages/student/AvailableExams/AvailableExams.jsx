import { useEffect, useState }from "react";
import { Link } from "react-router-dom";
import "./AvailableExams.css";
import { getMyExams } from "../../../api/myExams.js";
import { formatDate } from "../../../utils/formatDate.js";

export default function AvailableExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadExams() {
            setLoading(true);
            setError("");
            try {
                const data = await getMyExams();
                setExams(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadExams();
    }, []);

    return (
        <div className="page">
            <div className="page-inner">
                <h1 className="page-title">Available exams</h1>
                <p className="page-subtitle mb-6">
                    View and take your exams on{" "}
                    <span className="page-brand">examhub</span>
                </p>

                {error && (
                    <div className="error-banner mb-4">
                        <span className="error-banner-label">Error.</span> {error}
                    </div>
                )}
                {loading ? (
                    <p className="empty-text">Loading...</p>
                ) : exams.length === 0 ? (
                    <div className="card empty-card">
                        <p className="empty-text">No exams available right now.</p>
                    </div>
                ) : (
                    <div className="exams-grid">
                        {exams.map((exam) => {
                            const isOpen = new Date(exam.ends_at) > new Date();
                            return (
                            <div key={exam.id} className="card-lg">
                                <div className="exam-card-top">
                                    <span className="badge-compact badge-course">
                                        {exam.courseCode || exam.course?.code}
                                    </span>
                                <span className={`badge-compact ${isOpen ? "badge-success-soft" : "badge-neutral"}`}>
                                    {isOpen ? "Open" : "Closed"}
                                </span>
                            </div>
                            <h2 className="exam-card-title">{exam.title}</h2>
                            {exam.description && (
                                <p className="exam-card-desc">{exam.description}</p>
                            )}
                            <p className="exam-card-deadline">
                                Available until {formatDate(exam.ends_at)}
                            </p>
                            {isOpen ? (
                                <Link to={`/student/exams/${exam.id}`} className="exam-card-btn">
                                    Take exam
                                </Link>
                            ) : (
                                <span className="exam-card-btn exam-card-btn-disabled">
                                    Take exam
                                </span>
                            )}
                        </div>
                            );
                        })}
                    </div>
            )}
        </div>
        </div>
    );
}