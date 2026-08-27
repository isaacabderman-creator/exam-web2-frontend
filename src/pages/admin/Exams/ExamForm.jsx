import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ExamForm.css";

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

const emptyForm = { course_id: "", title: "", description: "", starts_at: "", ends_at: "" };

function toLocalInput(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ExamForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = id !== undefined;

    const [courses, setCourses] = useState([]);
    const [exam, setExam] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
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
        async function loadCourses() {
            const res = await authFetch("/courses");
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (res.ok) setCourses(data || []);
        }
        loadCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        async function loadExam() {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch(`/exams/${id}`);
                if (handleAuthError(res.status)) return;
                const data = await res.json().catch(() => null);
                if (!res.ok) throw new Error(data?.message || "Échec du chargement de l'examen");
                setExam(data);
                setForm({
                    course_id: data.course?.id ?? "",
                    title: data.title,
                    description: data.description || "",
                    starts_at: toLocalInput(data.starts_at),
                    ends_at: toLocalInput(data.ends_at),
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadExam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    const locked = isEdit && exam && exam.attempt_count > 0;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (new Date(form.ends_at) <= new Date(form.starts_at)) {
            setError("La date de fin doit être après la date de début.");
            return;
        }

        setSaving(true);
        try {
            const body = {
                course_id: Number(form.course_id),
                title: form.title,
                description: form.description || null,
                starts_at: new Date(form.starts_at).toISOString(),
                ends_at: new Date(form.ends_at).toISOString(),
            };
            const res = await authFetch(isEdit ? `/exams/${id}` : "/exams", {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify(body),
            });
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Échec de l'enregistrement de l'examen");
            navigate("/admin/exams");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="page">
            <div className="page-inner">
                <nav className="breadcrumb">
                    <Link to="/admin/exams">Examens</Link>
                    <span> › </span>
                    <span>
                        {isEdit
                            ? (loading ? "..." : exam?.title || "Examen") + " › Modifier"
                            : "Nouvel examen"}
                    </span>
                </nav>

                <h1 className="mt-3 page-title">
                    {isEdit ? "Modifier l'examen" : "Nouvel examen"}
                </h1>

                {error && (
                    <div className="error-banner mt-4">
                        <b className="error-banner-label">Erreur ·</b> {error}
                    </div>
                )}

                {locked && (
                    <div className="mt-4 rounded-[24px] border border-orange bg-white px-4 py-3 text-[14px] text-orange">
                        Verrouillé : cet examen a des tentatives et ne peut plus être modifié.
                    </div>
                )}

                {loading ? (
                    <p className="mt-6 text-[14px] text-[#6C6C6C]">Chargement...</p>
                ) : (
                    <div className="mt-6 max-w-xl rounded-[24px] border border-ink bg-white p-[18px]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="exam-select-wrap">
                                <select
                                    required
                                    disabled={locked}
                                    value={form.course_id}
                                    onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                                    className="input exam-select"
                                >
                                    <option value="" disabled>
                                        Sélectionner un cours
                                    </option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} — {course.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined exam-select-icon">
                                    expand_more
                                </span>
                            </div>
                            <input
                                type="text"
                                required
                                disabled={locked}
                                placeholder="Titre"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input"
                            />
                            <textarea
                                rows={3}
                                disabled={locked}
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="input resize-none"
                            />
                            <label className="field-label">
                                Début
                                <input
                                    type="datetime-local"
                                    required
                                    disabled={locked}
                                    value={form.starts_at}
                                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                                    className="input"
                                />
                            </label>
                            <label className="field-label">
                                Fin
                                <input
                                    type="datetime-local"
                                    required
                                    disabled={locked}
                                    value={form.ends_at}
                                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                                    className="input"
                                />
                            </label>

                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/exams")}
                                    className="btn-ghost"
                                >
                                    Annuler
                                </button>
                                {!locked && (
                                    <button type="submit" disabled={saving} className="btn-primary">
                                        {saving ? "Enregistrement..." : "Enregistrer"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
