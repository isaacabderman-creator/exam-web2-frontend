import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getExams, deleteExam } from "../../../api/exams.js";
import { formatDate } from "../../../utils/formatDate.js";
import TableSkeleton from "../../../components/TableSkeleton.jsx";

function getStatus(exam) {
    const now = new Date();
    if (now < new Date(exam.starts_at)) {
        return { label: "Programmé", className: "badge-amber" };
    }
    if (now > new Date(exam.ends_at)) {
        return { label: "Fermé", className: "badge-neutral" };
    }
    return { label: "Ouvert", className: "badge-success" };
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

    function handleAuthError(err) {
        if (err.status === 401) {
            navigate("/login");
            return true;
        }
        if (err.status === 403) {
            navigate("/student/exams");
            return true;
        }
        return false;
    }

    async function loadExams() {
        setLoading(true);
        setError("");
        try {
            const data = await getExams();
            setExams(data);
        } catch (err) {
            if (!handleAuthError(err)) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(exam) {
        if (!window.confirm(`Supprimer l'examen "${exam.title}" ?`)) return;
        setDeletingId(exam.id);
        try {
            await deleteExam(exam.id);
            await loadExams();
        } catch (err) {
            if (!handleAuthError(err)) {
                setError(err.message);
            }
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="page">
            <div className="page-inner">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="page-title">
                            Examens
                        </h1>
                        <p className="page-subtitle">
                            Gérer les examens proposés sur{" "}
                            <span className="font-semibold">examhub</span>
                        </p>
                    </div>
                    <Link to="/admin/exams/new" className="btn-primary">
                        + Nouvel examen
                    </Link>
                </div>

                {error && (
                    <div className="error-banner mb-4">
                        <b className="error-banner-label">Erreur ·</b> {error}
                    </div>
                )}

                <div className="table-wrap">
                    {loading ? (
                        <TableSkeleton />
                    ) : exams.length === 0 ? (
                        <p className="table-state">
                            Aucun examen pour l'instant.
                        </p>
                    ) : (
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr>
                                    {["Titre", "Cours", "Fenêtre", "Statut", ""].map((header, index) => (
                                        <th
                                            key={header + index}
                                            className={`table-head-cell ${index === 4 ? "table-head-cell-end" : ""}`}
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
                                                className="table-cell font-medium"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {exam.title}
                                            </td>
                                            <td
                                                className="table-cell text-[#6C6C6C]"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {exam.course?.name}
                                            </td>
                                            <td
                                                className="table-cell text-[#6C6C6C]"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                {formatDate(exam.starts_at)} → {formatDate(exam.ends_at)}
                                            </td>
                                            <td
                                                className="table-cell"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`badge ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                    {locked && (
                                                        <span className="badge badge-orange">
                                                            Verrouillé
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className="table-cell text-right"
                                                style={{ borderBottom: rowBorder }}
                                            >
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        to={`/admin/exams/${exam.id}/questions`}
                                                        className="badge badge-outline"
                                                    >
                                                        Questions
                                                    </Link>
                                                    <Link
                                                        to={`/admin/exams/${exam.id}/results`}
                                                        className="badge badge-outline"
                                                    >
                                                        Résultats
                                                    </Link>
                                                    {locked ? (
                                                        <span
                                                            className="badge badge-disabled"
                                                            title="Verrouillé : cet examen a des tentatives"
                                                        >
                                                            Modifier
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            to={`/admin/exams/${exam.id}/edit`}
                                                            className="badge badge-outline"
                                                        >
                                                            Modifier
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(exam)}
                                                        disabled={locked || deletingId === exam.id}
                                                        title={locked ? "Verrouillé : cet examen a des tentatives" : undefined}
                                                        className="badge badge-amber"
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
