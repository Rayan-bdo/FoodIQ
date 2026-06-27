import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    apiFetch("/api/auth/profile")
      .then((res) => setStatus(res.ok ? "ok" : "ko"))
      .catch(() => setStatus("ko"));
  }, []);

  if (status === "checking") return null;
  if (status === "ko") return <Navigate to="/" replace />;
  return children;
}