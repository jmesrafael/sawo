// src/admin/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiMe, clearSession, getSession } from "../lib/api";
import { C, F } from "./ui";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    if (!getSession()) return setStatus("denied");
    apiMe().then(() => setStatus("ok")).catch(() => { clearSession(); setStatus("denied"); });
  }, []);
  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: F, color: C.textLight, gap: 10, fontSize: "0.85rem" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ color: C.primary }} />
        Verifying session…
      </div>
    );
  }
  return status === "ok" ? children : <Navigate to="/admin/login" replace />;
}
