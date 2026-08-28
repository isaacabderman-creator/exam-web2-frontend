export function landingPath(user) {
  if (!user) return "/login";
  return user.role === "admin" ? "/admin" : "/student/exams";
}
