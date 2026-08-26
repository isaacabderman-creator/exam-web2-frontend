import { useEffect, useState } from "react";

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

    async function loadCourses() {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch("/courses");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load Courses");
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
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save course");
            setShowModal(false);
            await loadCourses();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(course) {
        if (!window.confirm(`Delete course "${course.name}"?`)) return;

        try {
            const res = await authFetch(`/courses/${course.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json();
                if (res.status === 409) {
                    throw new Error(
                        data.message ||
                        "This course has exams and cannot be deleted."
                    );
                }
                throw new Error(data.message || "Failed to delete course");
            }
            await loadCourses();
        } catch (err) {
            setError(err.message);
        }
    }

     return (
    <div className="p-6" style={{ backgroundColor: "#FBFBED" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#141B34" }}>
            Courses
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6C6C6C" }}>
            Manage the courses offered on{" "}
            <span className="font-semibold" style={{ color: "#E25A00" }}>
              examhub
            </span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="text-white text-sm font-medium px-4 py-2 transition"
          style={{ backgroundColor: "#396EE9", borderRadius: "24px" }}
        >
          + New course
        </button>
      </div>

      {error && (
        <div
          className="mb-4 text-sm px-4 py-3"
          style={{
            backgroundColor: "#FBEDED",
            color: "#995900",
            borderRadius: "24px",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "28px",
          border: "1px solid #E9E8E8",
          boxShadow: "0 8px 24px rgba(20,27,52,.06)",
        }}
      >
        {loading ? (
          <p className="p-6 text-sm" style={{ color: "#A7A4A4" }}>
            Loading...
          </p>
        ) : courses.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: "#A7A4A4" }}>
            No courses yet.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead
              className="uppercase text-xs"
              style={{ backgroundColor: "#FBFBED", color: "#A7A4A4" }}
            >
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  style={{ borderTop: "1px solid #E9E8E8" }}
                >
                  <td className="px-6 py-3 font-semibold" style={{ color: "#396EE9" }}>
                    {course.code}
                  </td>
                  <td className="px-6 py-3 font-medium" style={{ color: "#141B34" }}>
                    {course.name}
                  </td>
                  <td className="px-6 py-3" style={{ color: "#6C6C6C" }}>
                    {course.description || "—"}
                  </td>
                  <td className="px-6 py-3 text-right space-x-3">
                    <button
                      onClick={() => openEditModal(course)}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#396EE9" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#E25A00" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

       {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div
            className="w-full max-w-md p-6"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              boxShadow: "0 8px 24px rgba(20,27,52,.06)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "#141B34" }}
            >
              {editingId ? "Edit course" : "New course"}
            </h2>

            {formError && (
              <div
                className="mb-3 text-sm px-3 py-2"
                style={{
                  backgroundColor: "#FBEDED",
                  color: "#995900",
                  borderRadius: "24px",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#504949" }}
                >
                  Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROG2"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid #E9E8E8",
                    borderRadius: "24px",
                    color: "#141B34",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#504949" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid #E9E8E8",
                    borderRadius: "24px",
                    color: "#141B34",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#504949" }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    border: "1px solid #E9E8E8",
                    borderRadius: "24px",
                    color: "#141B34",
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-sm font-medium px-4 py-2"
                  style={{ color: "#6C6C6C" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-white text-sm font-medium px-4 py-2 transition disabled:opacity-50"
                  style={{ backgroundColor: "#396EE9", borderRadius: "24px" }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    );
}