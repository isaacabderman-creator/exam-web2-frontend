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
const btnAmber = "inline-flex items-center justify-center gap-2 rounded-full border border-[#141B34] bg-[#FDF8DB] px-[18px] py-[9px] text-[13px] font-medium text-[#995900] hover:brightness-95 transition-colors disabled:opacity-50";
const badgeBase = "inline-flex items-center gap-1.5 rounded-full border border-[#141B34] px-3 py-[3px] text-[12px] font-medium transition-colors disabled:opacity-50";
const inputBase = "w-full rounded-[24px] border border-[#141B34] bg-white px-[18px] py-[13px] text-[15px] text-[#141B34] placeholder:text-[#A7A4A4] outline-none transition-colors focus:border-2 focus:border-[#396EE9] focus:px-[17px] focus:py-[12px]";

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