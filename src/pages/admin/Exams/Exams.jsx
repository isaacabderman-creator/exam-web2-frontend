import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Exams.css";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full border border-ink bg-peach px-[22px] py-[9px] text-[13px] font-medium text-ink hover:bg-[#FAECD1] disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

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

function getStatus(exam) {
    const now = new Date();
    if (now < new Date(exam.starts_at)) {
        return { label: "Programmé", className: "exam-badge-scheduled" };
    }
    if (now > new Date(exam.ends_at)) {
        return { label: "Fermé", className: "exam-badge-closed" };
    }
    return { label: "Ouvert", className: "exam-badge-open" };
}

export default function Exams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadExams();
    }, []);

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

    async function loadExams() {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch("/exams");
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Échec du chargement des examens");
            setExams(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(exam) {
        if (!window.confirm(`Supprimer l'examen "${exam.title}" ?`)) return;
        setDeletingId(exam.id);
        try {
            const res = await authFetch(`/exams/${exam.id}`, { method: "DELETE" });
            if (handleAuthError(res.status)) return;
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Échec de la suppression de l'examen");
            }
            await loadExams();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="min-h-screen px-6 pb-6 pt-12 bg-cream text-ink">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-[32px] font-bold leading-[38px] tracking-[-0.02em]">
                            Examens
                        </h1>
                        <p className="mt-1 text-[14px] text-[#6C6C6C]">
                            Gérer les examens proposés sur{" "}
                            <span className="font-semibold">examhub</span>
                        </p>
                    </div>
                    <Link to="/admin/exams/new" className={btnPrimary}>
                        + Nouvel examen
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-3 text-[14px]">
                        <b className="font-medium text-[#9B3B3B]">Erreur ·</b> {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-[24px] border border-ink bg-white">
                    {loading ? (
                        <p className="p-10 text-center text-[14px] text-[#6C6C6C]">
                            Chargement...
                        </p>
                    ) : exams.length === 0 ? (
                        <p className="p-10 text-center text-[14px] text-[#6C6C6C]">
                            Aucun examen pour l'instant.
                        </p>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr>
                                    {["Titre", "Cours", "Fenêtre", "Statut", ""].map((header, index) => (
                                        <th
                                            key={header + index}
                                            className={`border-b border-ink bg-[#FEF8F1] px-[14px] py-[12px] text-[11px] font-bold uppercase tracking-[0.08em] text-[#A7A4A4] ${
                                                index === 4 ? "text-right" : "text-left"
                                            }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam, index) => {
                                    const isLast = index === exams.length - 1;
                                    const rowBorder = isLast ? "none" : "1px solid #E9E8E8";
                                    const status = getStatus(exam);
                                    const locked = exam.attempt_count > 0;
                                    return (
                                        <tr key={exam.id}>
                                            <td
                                                className="px-[14px] py-[11px] font-medium"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {exam.title}
                                            </td>
                                            <td
                                                className="px-[14px] py-[11px] text-[#6C6C6C]"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {exam.course?.name}
                                            </td>
                                            <td
                                                className="px-[14px] py-[11px] text-[#6C6C6C]"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {formatDate(exam.starts_at)} → {formatDate(exam.ends_at)}
                                            </td>
                                            <td
                                                className="px-[14px] py-[11px]"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`exam-badge ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                    {locked && (
                                                        <span className="exam-badge exam-badge-locked">
                                                            Verrouillé
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className="px-[14px] py-[11px] text-right"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        to={`/admin/exams/${exam.id}/questions`}
                                                        className="exam-badge exam-action-link"
                                                    >
                                                        Questions
                                                    </Link>
                                                    <Link
                                                        to={`/admin/exams/${exam.id}/results`}
                                                        className="exam-badge exam-action-link"
                                                    >
                                                        Résultats
                                                    </Link>
                                                    {locked ? (
                                                        <span
                                                            className="exam-badge exam-action-disabled"
                                                            title="Verrouillé : cet examen a des tentatives"
                                                        >
                                                            Modifier
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            to={`/admin/exams/${exam.id}/edit`}
                                                            className="exam-badge exam-action-link"
                                                        >
                                                            Modifier
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(exam)}
                                                        disabled={locked || deletingId === exam.id}
                                                        title={locked ? "Verrouillé : cet examen a des tentatives" : undefined}
                                                        className="exam-badge exam-action-delete"
                                                    >
                                                        {deletingId === exam.id ? "..." : "Supprimer"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
