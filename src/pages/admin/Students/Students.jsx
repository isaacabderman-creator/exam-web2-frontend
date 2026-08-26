import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Students.css";

const API_URL = "/api/students";
function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const message = body?.message || "Une erreur est survenue.";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return body;
}

const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-full border border-[#141B34] bg-[#FCEBD6] px-[22px] py-[9px] text-[13px] font-medium text-[#141B34] hover:bg-[#FAECD1] disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
const btnGhost = "inline-flex items-center justify-center gap-2 rounded-full border border-[#141B34] bg-white px-[18px] py-[9px] text-[13px] font-medium text-[#141B34] hover:bg-[#FEF8F1] transition-colors";
const btnAmber = "inline-flex items-center justify-center gap-2 rounded-full border border-amber bg-butter px-[18px] py-[9px] text-[13px] font-medium text-amber hover:brightness-95 transition-colors disabled:opacity-50";
const badgeBase = "inline-flex items-center gap-1.5 rounded-full border border-[#141B34] px-3 py-[3px] text-[12px] font-medium transition-colors disabled:opacity-50";
const inputBase = "w-full rounded-[24px] border border-[#141B34] bg-white px-[18px] py-[13px] text-[15px] text-[#141B34] placeholder:text-[#A7A4A4] outline-none transition-colors focus:border-2 focus:border-[#396EE9] focus:px-[17px] focus:py-[12px]";

function generateTempPassword() {
  return Math.random().toString(36).slice(-10);
}

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "",});

  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);

  const [editForm, setEditForm] = useState({name: "", email: "",});

  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const [resettingStudent, setResettingStudent] = useState(null);
  const [tempPassword, setTempPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  const [confirmStudent, setConfirmStudent] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => { loadStudents(); }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleAuthError(err) {
    if (err.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    if (err.status === 403) {
      navigate("/student");
      return true;
    }
    return false;
  }

  async function loadStudents() {
    setLoading(true);
    setGlobalError("");
    try {
      const data = await apiFetch(API_URL);
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (err) {
      if (!handleAuthError(err)) {
        setGlobalError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }
  function openCreateModal() {
    setCreateForm({ name: "", email: "", password: "",});
    setCreateError("");
    setShowCreateModal(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      await apiFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setShowCreateModal(false);
      setToast({
        type: "ok",
        text: "Étudiant créé.",
      });
      await loadStudents();
    } catch (err) {
      if (!handleAuthError(err)) {
        setCreateError(err.message);
      }
    } finally {
      setCreating(false);
    }
  }
  function openEditModal(student) {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
    });
    setEditError("");
  }
  async function handleEdit(e) {
    e.preventDefault();
    setEditError("");
    setSaving(true);
    try {
      await apiFetch(`${API_URL}/${editingStudent.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setEditingStudent(null);
      setToast({
        type: "ok",
        text: "Étudiant modifié.",
      });
      await loadStudents();
    } catch (err) {
      if (!handleAuthError(err)) {
        setEditError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  function openResetModal(student) {
  setResettingStudent(student);
  setTempPassword("");
  setResetError("");
}

async function handleResetPassword() {
  setResetError("");
  setResetting(true);
  try {
    const newPassword = generateTempPassword();
    await apiFetch(`${API_URL}/${resettingStudent.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: resettingStudent.name,
        email: resettingStudent.email,
        password: newPassword,
      }),
    });
    setTempPassword(newPassword);
  } catch (err) {
    if (!handleAuthError(err)) {
      setResetError(err.message);
    }
  } finally {
    setResetting(false);
  }
}
async function handleDeactivateStudent() {
    if (!confirmStudent) return;
    setDeactivatingId(confirmStudent.id);
    try {
      await apiFetch(`${API_URL}/${confirmStudent.id}`, {
        method: "DELETE",
      });
      setToast({
        type: "ok",
        text: "Étudiant désactivé.",
      });
      setConfirmStudent(null);
      await loadStudents();
    } catch (err) {
      if (!handleAuthError(err)) {
        setToast({
          type: "error",
          text: err.message,
        });
        setConfirmStudent(null);
      }
    } finally {
      setDeactivatingId(null);
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });
  return (
    <div
      className="min-h-screen px-6 pb-6 pt-12"
      style={{
        background: "var(--color-cream)",
        fontFamily: "'Google Sans Flex','Google Sans Text','Google Sans',system-ui,sans-serif",
        color: "#141B34",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-[38px] tracking-[-0.02em]"> Étudiants </h1>
            <p className="mt-1 text-[14px] text-[#6C6C6C]"> Gérer les comptes des étudiants. </p>
          </div>
          <button onClick={openCreateModal} className={btnPrimary}>
            <svg
              className="h-[16px] w-[16px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>

            Nouvel étudiant
          </button>
        </div>

        {globalError && (
          <div className="mb-4 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-3 text-[14px]">
            <b className="font-medium text-[#9B3B3B]">Erreur ·</b>{" "}
            {globalError}
          </div>
        )}
        <div className="mb-4 max-w-md">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputBase}
          />
        </div>
        <div className="overflow-hidden rounded-[24px] border border-[#141B34] bg-white">
          {loading ? (
            <div className="space-y-3 p-6">
              <div className="h-[14px] w-[60%] rounded-full border border-[#141B34] bg-[#FEF8F1]" />
              <div className="h-[14px] w-[85%] rounded-full border border-[#141B34] bg-[#FEF8F1]" />
              <div className="h-[14px] w-[40%] rounded-full border border-[#141B34] bg-[#FEF8F1]" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 h-[44px] w-[44px] rounded-[24px] border border-[#141B34] bg-[#FEF8F1]" />
              <div className="text-[17px] font-medium">
                Aucun étudiant trouvé
              </div>
              <div className="mt-1 text-[14px] text-[#6C6C6C]">
                {students.length === 0
                  ? "Les comptes créés par l'administrateur apparaîtront ici."
                  : "Essayez une autre recherche."}
              </div>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {["Nom", "Email", "Statut", ""].map((header, index) => (
                    <th
                      key={header + index}
                      className={`border-b border-[#141B34] bg-[#FEF8F1] px-[14px] py-[12px] text-[11px] font-bold uppercase tracking-[0.08em] text-[#A7A4A4] ${
                        index === 3 ? "text-right" : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student, index) => {
                  const isLast =
                    index === filteredStudents.length - 1;
                  const rowBorder = isLast
                    ? "none"
                    : "1px solid #E9E8E8";
                  return (
                    <tr key={student.id}>
                      <td
                        className="px-[14px] py-[11px] font-medium"
                        style={{
                          borderBottom: rowBorder,
                          color: student.is_active
                            ? "#141B34"
                            : "#A7A4A4",
                        }}
                      >
                        {student.name}
                      </td>
                      <td
                        className="px-[14px] py-[11px] font-mono text-[13px]"
                        style={{
                          borderBottom: rowBorder,
                          color: student.is_active
                            ? "#141B34"
                            : "#A7A4A4",
                        }}
                      >
                        {student.email}
                      </td>
                      <td
                        className="px-[14px] py-[11px]"
                        style={{
                          borderBottom: rowBorder,
                        }}
                      >
                        <span
                          className={badgeBase}
                          style={
                            student.is_active
                              ? {
                                  background: "#EDFBF2",
                                  color: "#2C6B45",
                                  borderColor: "#2C6B45",
                                }
                              : {
                                  background: "#F2F2F2",
                                  color: "#A7A4A4",
                                  borderColor: "#A7A4A4",
                                }
                          }
                        >
                          {student.is_active ? "Actif" : "Désactivé"}
                        </span>
                      </td>

                      <td
                        className="px-[14px] py-[11px] text-right"
                        style={{
                          borderBottom: rowBorder,
                        }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className={badgeBase}
                            style={{
                              background: "transparent",
                            }}
                          >
                            Modifier
                          </button>

                          {student.is_active && (
                            <>
                              <button
                                onClick={() => openResetModal(student)}
                                className={badgeBase}
                                style={{
                                  background: "#FDF8DB",
                                  color: "#995900",
                                  borderColor: "#995900",
                                }}
                              >
                                Mot de passe
                              </button>

                              <button
                                onClick={() =>
                                  setConfirmStudent(student)
                                }
                                disabled={
                                  deactivatingId === student.id
                                }
                                className={badgeBase}
                                style={{
                                  background: "#FDF8DB",
                                  color: "#995900",
                                  borderColor: "#995900",
                                }}
                              >
                                {deactivatingId === student.id
                                  ? "..."
                                  : "Désactiver"}
                              </button>
                            </>
                          )}
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

      {showCreateModal && (
        <div
          className="es-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="es-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="es-modal-header">
              Nouveau · étudiant
            </div>
            <div className="p-[18px]">
              {createError && (
                <div className="mb-3 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-2 text-[13px] text-[#9B3B3B]">
                  {createError}
                </div>
              )}
              <form
                onSubmit={handleCreate}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Nom complet"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      name: e.target.value,
                    })
                  }
                  className={inputBase}
                />
                <input
                  type="email"
                  required
                  placeholder="Adresse email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      email: e.target.value,
                    })
                  }
                  className={inputBase}
                />
                <input
                  type="password"
                  required
                  placeholder="Mot de passe initial"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      password: e.target.value,
                    })
                  }
                  className={inputBase}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={btnGhost}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className={btnPrimary}
                  >
                    {creating ? "Création..." : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {editingStudent && (
        <div
          className="es-overlay"
          onClick={() => setEditingStudent(null)}
        >
          <div
            className="es-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="es-modal-header">
              Modifier · {editingStudent.name}
            </div>

            <div className="p-[18px]">
              {editError && (
                <div className="mb-3 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-2 text-[13px] text-[#9B3B3B]">
                  {editError}
                </div>
              )}

              <form
                onSubmit={handleEdit}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  className={inputBase}
                />

                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email: e.target.value,
                    })
                  }
                  className={inputBase}
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className={btnGhost}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={btnPrimary}
                  >
                    {saving
                      ? "Enregistrement..."
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {resettingStudent && (
        <div
          className="es-overlay"
          onClick={() => setResettingStudent(null)}
        >
          <div
            className="es-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="es-modal-header">
              Réinitialiser · {resettingStudent.name}
            </div>

            <div className="p-[18px]">
              {resetError && (
                <div className="mb-3 rounded-[24px] border border-[#9B3B3B] bg-[#FBEDED] px-4 py-2 text-[13px] text-[#9B3B3B]">
                  {resetError}
                </div>
              )}

              {tempPassword ? (
                <div className="rounded-[24px] border border-green bg-mint px-4 py-3.5 text-green">
                  <div className="text-[14px] font-medium">
                    Mot de passe temporaire généré
                  </div>

                  <div className="mt-1.5 font-mono text-[16px]">
                    {tempPassword}
                  </div>

                  <div className="mt-1.5 text-[12px] text-[#504949]">
                    Affiché une seule fois — copiez-le avant de fermer.
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-[#504949]">
                  Un nouveau mot de passe temporaire sera généré et
                  affiché une seule fois.
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResettingStudent(null)}
                  className={btnGhost}
                >
                  Fermer
                </button>

                {!tempPassword && (
                  <button
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className={btnAmber}
                  >
                    {resetting ? "..." : "Générer"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmStudent && (
        <div
          className="es-overlay"
          onClick={() => setConfirmStudent(null)}
        >
          <div
            className="es-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="es-modal-header">
              Confirmer · désactivation
            </div>

            <div className="p-[18px]">
              <div className="text-[16px] font-medium">
                Désactiver {confirmStudent.name} ?
              </div>
              <p className="mt-2 text-[14px] text-[#504949]">
                Il ne pourra plus se connecter. Ses résultats resteront
                consultables par l'administrateur.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setConfirmStudent(null)}
                  className={btnGhost}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeactivateStudent}
                  disabled={
                    deactivatingId === confirmStudent.id
                  }
                  className={btnAmber}
                >
                  {deactivatingId === confirmStudent.id
                    ? "..."
                    : "Désactiver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="es-toast-wrap">
          <div
            className="es-toast"
            style={{
              background:
                toast.type === "ok"
                  ? "#EDFBF2"
                  : "#FBEDED",
            }}
          >
            <span
              className="es-toast-icon"
              style={{
                background:
                  toast.type === "ok"
                    ? "#60B32D"
                    : "#9B3B3B",
              }}
            >
              {toast.type === "ok" ? "✓" : "!"}
            </span>

            <span className="text-[14px]">
              {toast.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
