import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ExamQuestions.css";

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

function emptyQuestionForm() {
    return {
        statement: "",
        points: 1,
        position: 1,
        choices: [
            { text: "", is_correct: true },
            { text: "", is_correct: false },
        ],
    };
}

export default function ExamQuestions() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyQuestionForm());
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function handleAuthError(status) {
        if (status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return true;
        }
        if (status === 403) {
            navigate("/student/exams");
            return true;
        }
        return false;
    }

    useEffect(() => {
        async function loadAll() {
            setLoading(true);
            setError("");
            try {
                const [examRes, questionsRes] = await Promise.all([
                    authFetch(`/exams/${id}`),
                    authFetch(`/exams/${id}/questions`),
                ]);
                if (handleAuthError(examRes.status) || handleAuthError(questionsRes.status)) return;
                const examData = await examRes.json().catch(() => null);
                const questionsData = await questionsRes.json().catch(() => null);
                if (!examRes.ok) throw new Error(examData?.message || "Échec du chargement de l'examen");
                if (!questionsRes.ok) throw new Error(questionsData?.message || "Échec du chargement des questions");
                setExam(examData);
                setQuestions(questionsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, refreshKey]);

    function refresh() {
        setRefreshKey((k) => k + 1);
    }

    const locked = exam && exam.attempt_count > 0;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    function openCreateForm() {
        setEditingId(null);
        setForm({ ...emptyQuestionForm(), position: questions.length + 1 });
        setFormError("");
        setShowForm(true);
    }

    function openEditForm(question) {
        setEditingId(question.id);
        setForm({
            statement: question.statement,
            points: question.points,
            position: question.position,
            choices: question.choices.map((c) => ({ text: c.text, is_correct: c.is_correct })),
        });
        setFormError("");
        setShowForm(true);
    }

    function updateChoiceText(index, text) {
        const choices = form.choices.map((c, i) => (i === index ? { ...c, text } : c));
        setForm({ ...form, choices });
    }

    function setCorrectChoice(index) {
        const choices = form.choices.map((c, i) => ({ ...c, is_correct: i === index }));
        setForm({ ...form, choices });
    }

    function addChoice() {
        if (form.choices.length >= 6) return;
        setForm({ ...form, choices: [...form.choices, { text: "", is_correct: false }] });
    }

    function removeChoice(index) {
        if (form.choices.length <= 2) return;
        const removed = form.choices[index];
        const choices = form.choices.filter((_, i) => i !== index);
        if (removed.is_correct && !choices.some((c) => c.is_correct)) {
            choices[0].is_correct = true;
        }
        setForm({ ...form, choices });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            const body = {
                statement: form.statement,
                points: Number(form.points),
                position: Number(form.position),
                choices: form.choices,
            };
            const res = await authFetch(
                editingId ? `/questions/${editingId}` : `/exams/${id}/questions`,
                {
                    method: editingId ? "PUT" : "POST",
                    body: JSON.stringify(body),
                }
            );
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Échec de l'enregistrement de la question");
            setShowForm(false);
            refresh();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(question) {
        if (!window.confirm("Supprimer cette question ?")) return;
        setDeletingId(question.id);
        try {
            const res = await authFetch(`/questions/${question.id}`, { method: "DELETE" });
            if (handleAuthError(res.status)) return;
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Échec de la suppression de la question");
            }
            refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="page">
            <div className="page-inner">
                <nav className="breadcrumb">
                    <Link to="/admin/exams">Examens</Link>
                    <span> › </span>
                    <span>{loading ? "..." : exam?.title || "Examen"} › Questions</span>
                </nav>

                <div className="mt-3 mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="page-title">
                            Questions
                        </h1>
                        <p className="page-subtitle">
                            {questions.length} question{questions.length > 1 ? "s" : ""} · {totalPoints} point{totalPoints > 1 ? "s" : ""} au total
                        </p>
                    </div>
                    {!locked && (
                        <button onClick={openCreateForm} className="btn-primary">
                            + Nouvelle question
                        </button>
                    )}
                </div>

                {error && (
                    <div className="error-banner mb-4">
                        <b className="error-banner-label">Erreur ·</b> {error}
                    </div>
                )}

                {locked && (
                    <div className="mb-4 rounded-[24px] border border-orange bg-white px-4 py-3 text-[14px] text-orange">
                        Verrouillé : cet examen a des tentatives, les questions ne peuvent plus être modifiées.
                    </div>
                )}

                {loading ? (
                    <p className="table-state">Chargement...</p>
                ) : questions.length === 0 ? (
                    <div className="card empty-card text-[14px] text-[#6C6C6C]">
                        Aucune question pour l'instant.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {questions.map((question) => (
                            <div key={question.id} className="card">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium">{question.statement}</p>
                                        <p className="mt-1 text-[12px] text-[#6C6C6C]">
                                            {question.points} point{question.points > 1 ? "s" : ""} · position {question.position}
                                        </p>
                                    </div>
                                    {!locked && (
                                        <div className="flex shrink-0 gap-2">
                                            <button onClick={() => openEditForm(question)} className="badge badge-outline">
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(question)}
                                                disabled={deletingId === question.id}
                                                className="badge badge-amber"
                                            >
                                                {deletingId === question.id ? "..." : "Supprimer"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <ul className="mt-3 flex flex-col gap-1.5">
                                    {question.choices.map((choice) => (
                                        <li
                                            key={choice.id}
                                            className={choice.is_correct ? "exam-choice exam-choice-correct" : "exam-choice"}
                                        >
                                            {choice.is_correct ? "✓" : "—"} {choice.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            {editingId ? "Modifier · question" : "Nouvelle · question"}
                        </div>
                        <div className="modal-body">
                            {formError && (
                                <div className="error-banner-compact mb-3">
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <textarea
                                    rows={2}
                                    required
                                    placeholder="Énoncé"
                                    value={form.statement}
                                    onChange={(e) => setForm({ ...form, statement: e.target.value })}
                                    className="input resize-none"
                                />
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        placeholder="Points"
                                        value={form.points}
                                        onChange={(e) => setForm({ ...form, points: e.target.value })}
                                        className="input"
                                    />
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        placeholder="Position"
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                                        className="input"
                                    />
                                </div>

                                <p className="field-label">Choix (2 à 6, un seul correct)</p>
                                {form.choices.map((choice, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correct-choice"
                                            checked={choice.is_correct}
                                            onChange={() => setCorrectChoice(index)}
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder={`Choix ${index + 1}`}
                                            value={choice.text}
                                            onChange={(e) => updateChoiceText(index, e.target.value)}
                                            className="input"
                                        />
                                        {form.choices.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeChoice(index)}
                                                className="exam-choice-remove"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {form.choices.length < 6 && (
                                    <button type="button" onClick={addChoice} className="btn-ghost">
                                        + Ajouter un choix
                                    </button>
                                )}

                                <div className="mt-2 flex gap-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={saving} className="btn-primary">
                                        {saving ? "Enregistrement..." : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
