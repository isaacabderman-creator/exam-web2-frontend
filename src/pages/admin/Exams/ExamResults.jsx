import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ExamResults.css";

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

export default function ExamResults() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        async function loadResults() {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch(`/exams/${id}/results`);
                if (handleAuthError(res.status)) return;
                const body = await res.json().catch(() => null);
                if (!res.ok) throw new Error(body?.message || "Échec du chargement des résultats");
                setData(body);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="min-h-screen px-6 pb-6 pt-12 bg-cream text-ink">
            <div className="mx-auto max-w-5xl">
                <nav className="exam-breadcrumb">
                    <Link to="/admin/exams">Examens</Link>
                    <span> › </span>
                    <span>{loading ? "..." : data?.exam?.title || "Examen"} › Résultats</span>
                </nav>

                <h1 className="mt-3 text-[32px] font-bold leading-[38px] tracking-[-0.02em]">
                    Résultats
                </h1>

                {error && (
                    <div className="mt-4 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-3 text-[14px]">
                        <b className="font-medium text-[#9B3B3B]">Erreur ·</b> {error}
                    </div>
                )}

                {loading ? (
                    <p className="mt-6 text-[14px] text-[#6C6C6C]">Chargement...</p>
                ) : data && (
                    <div className="mt-6 rounded-[24px] border border-ink bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-[14px] text-[#6C6C6C]">
                                {data.attempt_count} tentative{data.attempt_count > 1 ? "s" : ""} · sur {data.total_points} point{data.total_points > 1 ? "s" : ""}
                            </p>
                            <p className="text-[14px] font-semibold">
                                Moyenne :{" "}
                                {data.average === null
                                    ? "aucune tentative pour l'instant"
                                    : `${data.average} / ${data.total_points}`}
                            </p>
                        </div>

                        {data.results.length === 0 ? (
                            <p className="p-10 text-center text-[14px] text-[#6C6C6C]">
                                Aucune tentative pour l'instant.
                            </p>
                        ) : (
                            <div className="exam-chart">
                                {data.results.map((r) => {
                                    const pct = data.total_points > 0 ? (r.score / data.total_points) * 100 : 0;
                                    return (
                                        <div key={r.student_id} className="exam-chart-bar-col">
                                            <span className="exam-chart-score">{r.score}</span>
                                            <div className="exam-chart-track">
                                                <div
                                                    className="exam-chart-bar"
                                                    style={{ height: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="exam-chart-name">{r.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
