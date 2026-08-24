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

