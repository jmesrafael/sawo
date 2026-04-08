// src/admin/Login.jsx — v4: centered, logo, forgot password
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  apiLogin,
  saveSession,
  getSession,
  apiForgotPassword,
  apiResetPassword,
} from "../lib/api";
import { Toast, useToast, C, F } from "./ui";

// Logo — update path to match your project
import logo from "../assets/SAWO-logo.webp";

const inputStyle = (focused) => ({
  width: "100%",
  padding: "10px 10px 10px 36px",
  borderRadius: 7,
  border: `1.5px solid ${focused ? C.primary : C.border}`,
  outline: "none",
  fontFamily: F,
  fontSize: "0.875rem",
  color: C.text,
  boxSizing: "border-box",
  background: "#fff",
  transition: "border-color 0.18s",
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, add, remove } = useToast();
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uFocused, setUFocused] = useState(false);
  const [pFocused, setPFocused] = useState(false);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState("");

  // Reset
  const [resetPass, setResetPass] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Check for reset token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setView("reset");
    } else if (getSession()) navigate("/admin/dashboard", { replace: true });
  }, [navigate, searchParams]);

  // ── Login ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password)
      return add("Please enter your username and password.", "error");
    setLoading(true);
    try {
      const { token, user } = await apiLogin(username.trim(), password);
      saveSession(token, user);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      add(err.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim())
      return add("Please enter your email address.", "error");
    setLoading(true);
    try {
      const res = await apiForgotPassword(forgotEmail.trim());
      if (res.dev_reset_url) {
        // Dev mode — show the link directly
        add("Dev mode: check your browser console for the reset link.", "info");
        console.log("Reset URL:", res.dev_reset_url);
      } else {
        add(
          "If that email is registered, a reset link has been sent.",
          "success",
        );
      }
      setTimeout(() => setView("login"), 3000);
    } catch (err) {
      add(err.message || "Failed to send reset email.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetPass || !resetConfirm)
      return add("Please fill in both fields.", "error");
    if (resetPass !== resetConfirm)
      return add("Passwords do not match.", "error");
    if (resetPass.length < 6)
      return add("Password must be at least 6 characters.", "error");
    setLoading(true);
    try {
      await apiResetPassword(resetToken, resetPass);
      add("Password updated! You can now sign in.", "success");
      setTimeout(() => {
        setView("login");
        setResetToken("");
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      add(err.message || "Reset failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        padding: 16,
      }}
    >
      <Toast toasts={toasts} remove={remove} />
      <style>{`
        .login-input-wrap i { pointer-events: none; }
      `}</style>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 8px 40px rgba(44,31,19,0.1)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <a
            href="https://sawo.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={logo}
              alt="SAWO"
              style={{ height: 48, objectFit: "contain" }}
            />
          </a>
        </div>

        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <>
            <h2
              style={{
                fontFamily: F,
                fontWeight: 700,
                color: C.text,
                margin: "0 0 4px",
                fontSize: "1.15rem",
                textAlign: "center",
              }}
            >
              SAWO ADMIN
            </h2>
            <p
              style={{
                fontFamily: F,
                color: C.textLight,
                margin: "0 0 22px",
                fontSize: "0.78rem",
                textAlign: "center",
              }}
            >
            </p>

            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Username */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.textMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: F,
                    marginBottom: 5,
                  }}
                >
                  Username
                </label>
                <div
                  style={{ position: "relative" }}
                  className="login-input-wrap"
                >
                  <i
                    className="fa-solid fa-user"
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: uFocused ? C.primary : C.textLight,
                      fontSize: "0.82rem",
                      transition: "color 0.18s",
                    }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoFocus
                    onFocus={() => setUFocused(true)}
                    onBlur={() => setUFocused(false)}
                    style={inputStyle(uFocused)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.textMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: F,
                    marginBottom: 5,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <i
                    className="fa-solid fa-lock"
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: pFocused ? C.primary : C.textLight,
                      fontSize: "0.82rem",
                      transition: "color 0.18s",
                    }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onFocus={() => setPFocused(true)}
                    onBlur={() => setPFocused(false)}
                    style={{
                      ...inputStyle(pFocused),
                      padding: "10px 36px 10px 36px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.textLight,
                      fontSize: "0.85rem",
                      padding: 2,
                    }}
                  >
                    <i
                      className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                    />
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: -6 }}>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.primary,
                    fontFamily: F,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 7,
                  border: "none",
                  background: loading ? C.primaryLt : C.primary,
                  color: "#fff",
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.18s",
                  marginTop: 4,
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-right-to-bracket" /> Sign In
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === "forgot" && (
          <>
            <h2
              style={{
                fontFamily: F,
                fontWeight: 700,
                color: C.text,
                margin: "0 0 4px",
                fontSize: "1.15rem",
                textAlign: "center",
              }}
            >
              Reset Password
            </h2>
            <p
              style={{
                fontFamily: F,
                color: C.textLight,
                margin: "0 0 22px",
                fontSize: "0.78rem",
                textAlign: "center",
              }}
            >
              Enter your email to receive a reset link
            </p>

            <form
              onSubmit={handleForgot}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.textMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: F,
                    marginBottom: 5,
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <i
                    className="fa-solid fa-envelope"
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                      fontSize: "0.82rem",
                    }}
                  />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoFocus
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 7,
                  border: "none",
                  background: loading ? C.primaryLt : C.primary,
                  color: "#fff",
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" /> Send Reset Link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setView("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: C.primary,
                  fontFamily: F,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                <i
                  className="fa-solid fa-arrow-left"
                  style={{ marginRight: 5 }}
                />
                Back to Sign In
              </button>
            </form>
          </>
        )}

        {/* ── RESET PASSWORD VIEW ── */}
        {view === "reset" && (
          <>
            <h2
              style={{
                fontFamily: F,
                fontWeight: 700,
                color: C.text,
                margin: "0 0 4px",
                fontSize: "1.15rem",
                textAlign: "center",
              }}
            >
              Set New Password
            </h2>
            <p
              style={{
                fontFamily: F,
                color: C.textLight,
                margin: "0 0 22px",
                fontSize: "0.78rem",
                textAlign: "center",
              }}
            >
              Choose a strong password (at least 6 characters)
            </p>

            <form
              onSubmit={handleReset}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.textMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: F,
                    marginBottom: 5,
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <i
                    className="fa-solid fa-lock"
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                      fontSize: "0.82rem",
                    }}
                  />
                  <input
                    type="password"
                    value={resetPass}
                    onChange={(e) => setResetPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoFocus
                    style={inputStyle(false)}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: C.textMid,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: F,
                    marginBottom: 5,
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <i
                    className="fa-solid fa-lock"
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.textLight,
                      fontSize: "0.82rem",
                    }}
                  />
                  <input
                    type="password"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                    placeholder="Repeat password"
                    style={inputStyle(false)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 7,
                  border: "none",
                  background: loading ? C.primaryLt : C.primary,
                  color: "#fff",
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Updating…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key" /> Update Password
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
