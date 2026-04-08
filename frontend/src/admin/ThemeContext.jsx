// src/admin/ThemeContext.jsx
// Provides dark mode state + toggle across all admin components
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSession, updateSessionUser, apiSetDarkMode } from "../lib/api";

const ThemeCtx = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

// ── CSS variables — must live at top-level so ALL pages (public + admin) get them ──
const CSS_VARS = `
  :root {
    --c-primary:        #af8564;
    --c-primary-dk:     #8c6a4f;
    --c-primary-lt:     #c9a47a;
    --c-primary-xlt:    #f5ede3;
    --c-bg:             #faf8f5;
    --c-surface:        #ffffff;
    --c-border:         #e8ddd3;
    --c-text:           #2c1f13;
    --c-text-mid:       #6b5040;
    --c-text-light:     #a08060;
    --c-sidebar-bg:     #ffffff;
    --c-sidebar-border: #ede4d8;
    --c-danger:         #c0392b;
    --c-danger-lt:      #fdecea;
    --c-success:        #27ae60;
    --c-success-lt:     #eaf7f0;
    --c-warning:        #e67e22;
    --c-warning-lt:     #fef5ec;
    --c-info:           #2980b9;
    --c-info-lt:        #ebf5fb;
  }
  [data-theme="dark"] {
    --c-primary:        #c9a07a;
    --c-primary-dk:     #af8564;
    --c-primary-lt:     #a07050;
    --c-primary-xlt:    #2a1f15;
    --c-bg:             #1a1210;
    --c-surface:        #231813;
    --c-border:         #3d2e22;
    --c-text:           #f0e8df;
    --c-text-mid:       #c9a07a;
    --c-text-light:     #8a6a50;
    --c-sidebar-bg:     #1e1510;
    --c-sidebar-border: #3d2e22;
    --c-danger:         #e05a4a;
    --c-danger-lt:      #3a1510;
    --c-success:        #3ac47a;
    --c-success-lt:     #0e2e1a;
    --c-warning:        #f09040;
    --c-warning-lt:     #2e1e08;
    --c-info:           #5aacda;
    --c-info-lt:        #0e2030;
  }
  * { box-sizing: border-box; }
  body { background: var(--c-bg); color: var(--c-text); transition: background 0.25s, color 0.25s; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes spin    { to { transform: rotate(360deg); } }
`;

// Inject once into <head> — idempotent
function injectGlobalStyles() {
  const id = "sawo-theme-vars";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = CSS_VARS;
  document.head.appendChild(style);
}

export function ThemeProvider({ children }) {
  const session = getSession();
  const [dark, setDark] = useState(() => {
    // Also honour a persisted preference outside of session
    const stored = localStorage.getItem("sawo_dark_mode");
    if (stored !== null) return stored === "true";
    return session?.user?.dark_mode || false;
  });

  // Inject CSS variables the very first time this provider mounts
  useEffect(() => { injectGlobalStyles(); }, []);

  // Apply data-theme attribute to <html> whenever dark changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("sawo_dark_mode", String(dark));
  }, [dark]);

  const toggle = useCallback(async () => {
    const next = !dark;
    setDark(next);
    updateSessionUser({ dark_mode: next });
    try { await apiSetDarkMode(next); } catch (e) { console.warn("Could not save dark mode", e); }
  }, [dark]);

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}
