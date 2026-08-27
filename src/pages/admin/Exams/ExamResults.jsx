import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getExamResults } from "../../../api/exams.js";

export default function ExamResults() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    useEffect(() => {
        async function loadResults() {
            setLoading(true);
            setError("");
            try {
                const body = await getExamResults(id);
                setData(body);
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
    }, [id]);

    return (
        <div className="page">
            <div className="page-inner">
                <nav className="breadcrumb">
                    <Link to="/admin/exams">Examens</Link>
                    <span> › </span>
                    <span>{loading ? "..." : data?.exam?.title || "Examen"} › Résultats</span>
                </nav>

                <h1 className="mt-3 page-title">
                    Résultats
                </h1>

                {error && (
                    <div className="error-banner mt-4">
                        <b className="error-banner-label">Erreur ·</b> {error}
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
