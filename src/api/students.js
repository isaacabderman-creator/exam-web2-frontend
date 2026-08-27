import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";

export function getStudents() {
  return apiGet("/students");
}

export function createStudent(data) {
  return apiPost("/students", data);
}

export function updateStudent(id, data) {
  return apiPut(`/students/${id}`, data);
}

export function deactivateStudent(id) {
  return apiDelete(`/students/${id}`);
}
