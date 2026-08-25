import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authFecth(path, options = {}) {
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
            const res = await authFecth("/courses");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load Courses");
            setCourses(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

}