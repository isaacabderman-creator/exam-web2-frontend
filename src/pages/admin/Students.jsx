import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, createStudent, updateStudent, deactivateStudent } from "../../api/students.js";
import { generateTempPassword } from "../../utils/generateTempPassword.js";
import TableSkeleton from "../../components/TableSkeleton.jsx";

const NAME_PATTERN = /^[\p{L}\s'-]+$/u;

function validateCreateForm(form) {
  if (!NAME_PATTERN.test(form.name.trim())) {
    return "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets.";
  }
  if (form.password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  return null;
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
      navigate("/login");
      return true;
    }
    if (err.status === 403) {
      navigate("/student/exams");
      return true;
    }
    return false;
  }

  async function loadStudents() {
    setLoading(true);
    setGlobalError("");
    try {
      const data = await getStudents();
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
    const validationError = validateCreateForm(createForm);
    if (validationError) {
      setCreateError(validationError);
      return;
    }
    setCreating(true);
    try {
      await createStudent(createForm);
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
      await updateStudent(editingStudent.id, editForm);
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
    await updateStudent(resettingStudent.id, {
      name: resettingStudent.name,
      email: resettingStudent.email,
      password: newPassword,
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
      await deactivateStudent(confirmStudent.id);
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
    <div className="page">
      <div className="page-inner">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="page-title"> Étudiants </h1>
            <p className="page-subtitle"> Gérer les comptes des étudiants. </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
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
          <div className="error-banner mb-4">
            <b className="error-banner-label">Erreur ·</b>{" "}
            {globalError}
          </div>
        )}
        <div className="mb-4 max-w-md">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div className="table-wrap">
          {loading ? (
            <TableSkeleton />
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 h-[44px] w-[44px] rounded-[24px] border border-ink bg-cream" />
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
                      className={`table-head-cell ${index === 3 ? "table-head-cell-end" : ""}`}
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
                        className="table-cell font-medium"
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
                        className="table-cell font-mono text-[13px]"
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
                        className="table-cell"
                        style={{
                          borderBottom: rowBorder,
                        }}
                      >
                        <span
                          className={`badge ${
                            student.is_active ? "badge-success-soft" : "badge-neutral"
                          }`}
                        >
                          {student.is_active ? "Actif" : "Désactivé"}
                        </span>
                      </td>

                      <td
                        className="table-cell text-right"
                        style={{
                          borderBottom: rowBorder,
                        }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="badge badge-outline"
                          >
                            Modifier
                          </button>

                          {student.is_active && (
                            <>
                              <button
                                onClick={() => openResetModal(student)}
                                className="badge badge-amber"
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
                                className="badge badge-amber"
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
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              Nouvel · étudiant
            </div>
            <div className="modal-body">
              {createError && (
                <div className="error-banner-compact mb-3">
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
                  className="input"
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
                  className="input"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mot de passe initial (8 caractères min.)"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      password: e.target.value,
                    })
                  }
                  className="input"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary"
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
          className="modal-overlay"
          onClick={() => setEditingStudent(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              Modifier · {editingStudent.name}
            </div>

            <div className="modal-body">
              {editError && (
                <div className="error-banner-compact mb-3">
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
                  className="input"
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
                  className="input"
                />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="btn-ghost"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
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
          className="modal-overlay"
          onClick={() => setResettingStudent(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              Réinitialiser · {resettingStudent.name}
            </div>

            <div className="modal-body">
              {resetError && (
                <div className="error-banner-compact mb-3">
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
                  className="btn-ghost"
                >
                  Fermer
                </button>

                {!tempPassword && (
                  <button
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="btn-amber"
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
          className="modal-overlay"
          onClick={() => setConfirmStudent(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              Confirmer · désactivation
            </div>

            <div className="modal-body">
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
                  className="btn-ghost"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeactivateStudent}
                  disabled={
                    deactivatingId === confirmStudent.id
                  }
                  className="btn-amber"
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
        <div className="toast-wrap">
          <div
            className="toast"
            style={{
              background:
                toast.type === "ok"
                  ? "#EDFBF2"
                  : "#FBEDED",
            }}
          >
            <span
              className="toast-icon"
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
