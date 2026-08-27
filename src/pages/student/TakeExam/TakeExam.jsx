import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./TakeExam.css";
import { getMyExam, submitMyExam } from "../../../api/myExams.js";

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
        async function loadExam() {
            setLoading(true);
            setError("");
            try {
                const data = await getMyExam(id);
                setExam(data);
            } catch (err) {
                if (!handleAuthError(err)) {
                    setError(err.message);
                }
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
            const answersPayload = Object.entries(answers).map(([questionId, choiceId]) => ({
                question_id: Number(questionId),
                choice_id: choiceId,
            }));
            const data = await submitMyExam(id, answersPayload);
            setResult(data);
        } catch (err) {
            if (!handleAuthError(err)) {
                setSubmitError(err.message);
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="page">
            <div className="page-inner-narrow">
                <nav className="breadcrumb">
                    <Link to="/student/exams">Available exams</Link>
                    <span> › </span>
                    <span>{loading ? "..." : exam?.title || "Exam"}</span>
                </nav>

                {error && (
                    <div className="error-banner mb-4">
                        <span className="error-banner-label">Error.</span> {error}
                    </div>
                )}

                {loading ? (
                    <p className="empty-text">Loading...</p>
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
                                                ? "card take-exam-correction-correct"
                                                : "card take-exam-correction-wrong"
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

                        <Link to="/student/exams" className="take-exam-btn">
                            Back to exams
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
                            <div className="error-banner mb-4">
                                <span className="error-banner-label">Error.</span> {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="take-exam-form">
                            {exam.questions.map((question, index) => (
                                <div key={question.id} className="card">
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
