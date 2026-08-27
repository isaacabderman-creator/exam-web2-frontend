import { apiPost } from "./client.js";

export function login(email, password) {
  return apiPost("/auth/login", { email, password });
}
