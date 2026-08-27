import { apiGet, apiPost } from "./client.js";

export function getMyExams() {
  return apiGet("/my/exams");
}

export function getMyExam(id) {
  return apiGet(`/my/exams/${id}`);
}

export function submitMyExam(id, answers) {
  return apiPost(`/my/exams/${id}/submit`, { answers });
}

export function getMyResults() {
  return apiGet("/my/results");
}
