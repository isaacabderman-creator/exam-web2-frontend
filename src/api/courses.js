import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";

export function getCourses() {
  return apiGet("/courses");
}

export function createCourse(data) {
  return apiPost("/courses", data);
}

export function updateCourse(id, data) {
  return apiPut(`/courses/${id}`, data);
}

export function deleteCourse(id) {
  return apiDelete(`/courses/${id}`);
}
