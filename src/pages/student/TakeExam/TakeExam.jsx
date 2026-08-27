import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./TakeExam.css";

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

export default function TakeExam() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState(null);

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
        async function loadExam() {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch(`/my/exams/${id}`);
                if (handleAuthError(res.status)) return;
                const data = await res.json().catch(() => null);
                if (!res.ok) throw new Error(data?.message || "Failed to load exam");
                setExam(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function selectChoice(questionId, choiceId) {
        setAnswers({ ...answers, [questionId]: choiceId });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitError("");
        setSubmitting(true);
        try {
            const body = {
                answers: Object.entries(answers).map(([questionId, choiceId]) => ({
                    question_id: Number(questionId),
                    choice_id: choiceId,
                })),
            };
            const res = await authFetch(`/my/exams/${id}/submit`, {
                method: "POST",
                body: JSON.stringify(body),
            });
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Failed to submit exam");
            setResult(data);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="take-exam-page">
            <div className="take-exam-inner">
                <nav className="take-exam-breadcrumb">
                    <Link to="/student/exams">Available exams</Link>
                    <span> › </span>
                    <span>{loading ? "..." : exam?.title || "Exam"}</span>
                </nav>

                {error && (
                    <div className="take-exam-error">
                        <span className="take-exam-error-label">Error.</span> {error}
                    </div>
                )}

                {loading ? (
                    <p className="take-exam-loading">Loading...</p>
                ) : error ? null : result ? (
                    <div className="take-exam-result">
                        <h1 className="take-exam-title">{exam.title}</h1>
                        <p className="take-exam-score">
                            Your score: <b>{result.score} / {result.total_points}</b>
                        </p>

                        <div className="take-exam-correction-list">
                            {result.correction.map((line) => {
                                const choices =
                                    exam.questions.find((q) => q.id === line.question_id)?.choices || [];
                                const studentChoice = choices.find((c) => c.id === line.student_choice_id);
                                const correctChoice = choices.find((c) => c.id === line.correct_choice_id);
                                return (
                                    <div
                                        key={line.question_id}
                                        className={
                                            line.is_correct
                                                ? "take-exam-correction-card take-exam-correction-correct"
                                                : "take-exam-correction-card take-exam-correction-wrong"
                                        }
                                    >
                                        <p className="take-exam-question-statement">{line.statement}</p>
                                        <p className="take-exam-correction-status">
                                            {line.is_correct ? "✓ Correct" : "✕ Incorrect"} · {line.points} point{line.points > 1 ? "s" : ""}
                                        </p>
                                        <p className="take-exam-answer-line">
                                            Your answer: {studentChoice ? studentChoice.text : "No answer"}
                                        </p>
                                        {!line.is_correct && (
                                            <p className="take-exam-answer-line take-exam-answer-correct">
                                                Correct answer: {correctChoice?.text}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <Link to="/student/results" className="take-exam-btn">
                            View all results
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="take-exam-title">{exam.title}</h1>
                        <p className="take-exam-subtitle">
                            {exam.course?.code} — {exam.course?.name} · {exam.question_count} question{exam.question_count > 1 ? "s" : ""} · {exam.total_points} point{exam.total_points > 1 ? "s" : ""}
                        </p>
                        {exam.description && <p className="take-exam-description">{exam.description}</p>}

                        {submitError && (
                            <div className="take-exam-error">
                                <span className="take-exam-error-label">Error.</span> {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="take-exam-form">
                            {exam.questions.map((question, index) => (
                                <div key={question.id} className="take-exam-question-card">
                                    <p className="take-exam-question-statement">
                                        {index + 1}. {question.statement}
                                        <span className="take-exam-question-points">
                                            {" "}({question.points} point{question.points > 1 ? "s" : ""})
                                        </span>
                                    </p>
                                    <div className="take-exam-choices">
                                        {question.choices.map((choice) => (
                                            <label key={choice.id} className="take-exam-choice">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    checked={answers[question.id] === choice.id}
                                                    onChange={() => selectChoice(question.id, choice.id)}
                                                />
                                                {choice.text}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button type="submit" disabled={submitting} className="take-exam-btn">
                                {submitting ? "Submitting..." : "Submit exam"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
