import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

function authFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}`} : {}),
            ...(options.headers || {}),
        },
    });
}

const emptyForm = { code: "", name: "", description: "" };

export default function Courses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        loadCourses();
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

    async function loadCourses() {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch("/courses");
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Échec du chargement des cours");
            setCourses(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    }

    function openEditModal(course) {
        setEditingId(course.id);
        setForm({
            code: course.code,
            name: course.name,
            description: course.description || "",
        });
        setFormError("");
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            const isEdit = editingId !== null;
            const res = await authFetch(
                isEdit ? `/courses/${editingId}` : "/courses",
                {
                    method: isEdit ? "PUT" : "POST",
                    body: JSON.stringify(form),
                }
            );
            if (handleAuthError(res.status)) return;
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || "Échec de l'enregistrement du cours");
            setShowModal(false);
            await loadCourses();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(course) {
        if (!window.confirm(`Supprimer le cours "${course.name}" ?`)) return;

        try {
            const res = await authFetch(`/courses/${course.id}`, {
                method: "DELETE",
            });
            if (handleAuthError(res.status)) return;
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                if (res.status === 409) {
                    throw new Error(
                        data?.message ||
                        "Ce cours a des examens et ne peut pas être supprimé."
                    );
                }
                throw new Error(data?.message || "Échec de la suppression du cours");
            }
            await loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

     return (
    <div className="page">
      <div className="page-inner">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Cours
            </h1>
            <p className="page-subtitle">
              Gérer les cours proposés sur{" "}
              <span className="font-semibold">examhub</span>
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            + Nouveau cours
          </button>
        </div>

        {error && (
          <div className="error-banner mb-4">
            <b className="error-banner-label">Erreur ·</b> {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[24px] border border-ink bg-white">
          {loading ? (
            <p className="p-10 text-center text-[14px] text-[#6C6C6C]">
              Chargement...
            </p>
          ) : courses.length === 0 ? (
            <p className="p-10 text-center text-[14px] text-[#6C6C6C]">
              Aucun cours pour l'instant.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {["Code", "Nom", "Description", ""].map((header, index) => (
                    <th
                      key={header + index}
                      className={`border-b border-ink bg-[#FEF8F1] px-[14px] py-[12px] text-[11px] font-bold uppercase tracking-[0.08em] text-[#A7A4A4] ${
                        index === 3 ? "text-right" : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => {
                  const isLast = index === courses.length - 1;
                  const rowBorder = isLast ? "none" : "1px solid #E9E8E8";
                  return (
                    <tr key={course.id}>
                      <td
                        className="px-[14px] py-[11px] font-semibold"
                        style={{ borderBottom: rowBorder }}
                      >
                        {course.code}
                      </td>
                      <td
                        className="px-[14px] py-[11px] font-medium"
                        style={{ borderBottom: rowBorder }}
                      >
                        {course.name}
                      </td>
                      <td
                        className="px-[14px] py-[11px] text-[#6C6C6C]"
                        style={{ borderBottom: rowBorder }}
                      >
                        {course.description || "—"}
                      </td>
                      <td
                        className="px-[14px] py-[11px] text-right"
                        style={{ borderBottom: rowBorder }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="badge badge-outline"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(course)}
                            className="badge badge-amber"
                          >
                            Supprimer
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editingId ? "Modifier · cours" : "Nouveau · cours"}
            </div>
            <div className="modal-body">
              {formError && (
                <div className="error-banner-compact mb-3">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Code (ex. PROG2)"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="input"
                />
                <input
                  type="text"
                  required
                  placeholder="Nom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
                <textarea
                  rows={3}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input resize-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-ghost"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
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