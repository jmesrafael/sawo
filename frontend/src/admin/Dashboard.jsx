// src/admin/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/api";
import { useTheme } from "./ThemeContext";
import { OfflineBanner, C, F } from "./ui";
import ProductsPage  from "./ProductsPage";
import LayoutPage    from "./LayoutPage";
import UsersPage     from "./UsersPage";
import DetailsPage   from "./DetailsPage";
import TaxonomyPage  from "./TaxonomyPage";

import logo from "../assets/SAWO-logo.webp";

const NAV = [
  { key: "products", label: "Products",          icon: "fa-box" },
  { key: "taxonomy", label: "Categories & Tags", icon: "fa-tags" },
  { key: "layout",   label: "Layout",            icon: "fa-table-cells" },
  { key: "users",    label: "Users",             icon: "fa-users" },
  { key: "details",  label: "Details",           icon: "fa-circle-info" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [active, setActive] = useState("products");
  const session = getSession();
  const user = session?.user;

  const handleLogout = () => {
    clearSession();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      <OfflineBanner />

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: F, background: C.bg }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 210,
          background: C.sidebarBg,
          borderRight: `1px solid ${C.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}>

          {/* Logo */}
          <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${C.sidebarBorder}`, textAlign: "center" }}>
            <a
              href="https://sawo.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", transition: "opacity 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              <img src={logo} alt="SAWO" style={{ height: 34, objectFit: "contain", display: "block" }} />
            </a>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 8px 0" }}>
            {NAV.map(n => {
              const isActive = active === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setActive(n.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    marginBottom: 2,
                    background: isActive ? C.primaryXlt : "none",
                    border: "none",
                    borderRadius: 6,
                    borderLeft: `3px solid ${isActive ? C.primary : "transparent"}`,
                    color: isActive ? C.primary : C.textMid,
                    fontFamily: F,
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.text; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMid; } }}
                >
                  <i className={`fa-solid ${n.icon}`} style={{ fontSize: "0.8rem", width: 14, textAlign: "center" }} />
                  {n.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom: user + dark mode + sign out */}
          <div style={{ padding: "10px 8px 14px", borderTop: `1px solid ${C.sidebarBorder}` }}>
            {user && (
              <div style={{ padding: "6px 10px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: C.text, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.full_name || user.username}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: C.textLight, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    @{user.username}
                  </div>
                </div>

                {/* Dark mode toggle */}
                <button
                  type="button"
                  onClick={toggle}
                  title={dark ? "Switch to light mode" : "Switch to dark mode"}
                  style={{
                    background: "none",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "5px 7px",
                    cursor: "pointer",
                    color: dark ? C.warning : C.textLight,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    marginLeft: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.primaryXlt; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = dark ? C.warning : C.textLight; }}
                >
                  <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                width: "100%",
                padding: "7px 12px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: "none",
                color: C.textMid,
                fontFamily: F,
                fontWeight: 500,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.dangerLt; e.currentTarget.style.color = C.danger; e.currentTarget.style.borderColor = C.danger; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.textMid; e.currentTarget.style.borderColor = C.border; }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.75rem" }} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {active === "products" && <ProductsPage currentUser={user} />}
          {active === "taxonomy" && <TaxonomyPage />}
          {active === "layout"   && <LayoutPage />}
          {active === "users"    && <UsersPage currentUser={user} />}
          {active === "details"  && <DetailsPage />}
        </main>
      </div>
    </>
  );
}
