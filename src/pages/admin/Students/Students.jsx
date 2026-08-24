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