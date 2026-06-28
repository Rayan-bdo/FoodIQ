const BASE = process.env.NODE_ENV === "production" 
  ? "https://foodiq-production.up.railway.app" 
  : "";

export function apiFetch(path, options = {}) {
  return fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}