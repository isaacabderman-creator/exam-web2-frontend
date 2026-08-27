export function generateTempPassword() {
  return Math.random().toString(36).slice(-10);
}
