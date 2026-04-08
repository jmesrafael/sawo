// src/admin/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Toast, useToast, Field, Btn } from "./ui";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toasts, add, remove } = useToast();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!pass || !confirm) return add("Please fill in both fields.", "error");
    if (pass !== confirm) return add("Passwords do not match.", "error");
    if (pass.length < 6) return add("Password must be at least 6 characters.", "error");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      add("Password updated! Redirecting to login…", "success");
      setTimeout(() => navigate("/admin/login", { replace: true }), 1500);
    } catch (err) {
      add(err.message || "Reset failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f5f0eb" }}>
      <Toast toasts={toasts} remove={remove} />
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 12px 30px rgba(139,94,60,0.15)" }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#2d1a0e", margin: "0 0 6px", textAlign: "center" }}>Set New Password</h1>
        <p style={{ fontSize: "0.8rem", color: "#a67853", margin: "0 0 24px", textAlign: "center" }}>Choose a strong password.</p>
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="New Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 6 characters" />
          <Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
          <Btn loading={loading} label="UPDATE PASSWORD" />
        </form>
      </div>
    </div>
  );
}
