import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    fetch("/api/auth/profile", { credentials: "include" })
      .then((res) => setStatus(res.ok ? "ok" : "ko"))
      .catch(() => setStatus("ko"));
  }, []);

  if (status === "checking") return null; // écran vide, rien affiché
  if (status === "ko") return <Navigate to="/" replace />;
  return children;
}