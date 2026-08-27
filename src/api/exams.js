import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";

export function getExams() {
  return apiGet("/exams");
}

export function getExam(id) {
  return apiGet(`/exams/${id}`);
}

export function createExam(data) {
  return apiPost("/exams", data);
}

export function updateExam(id, data) {
  return apiPut(`/exams/${id}`, data);
}

export function deleteExam(id) {
  return apiDelete(`/exams/${id}`);
}

export function getExamQuestions(examId) {
  return apiGet(`/exams/${examId}/questions`);
}

export function createQuestion(examId, data) {
  return apiPost(`/exams/${examId}/questions`, data);
}

export function updateQuestion(questionId, data) {
  return apiPut(`/questions/${questionId}`, data);
}

export function deleteQuestion(questionId) {
  return apiDelete(`/questions/${questionId}`);
}

export function getExamResults(examId) {
  return apiGet(`/exams/${examId}/results`);
}
