// src/admin/ui.jsx — v5 (dark mode via CSS vars, #af8564 primary)
// CSS variables are injected by ThemeContext → ThemeProvider (top-level in App.jsx)
import React, { useState, useRef, useEffect } from "react";

// ── GlobalStyles: kept as a no-op shim so existing imports don't break.
// The real CSS vars are injected by ThemeProvider in ThemeContext.jsx.
export const GlobalStyles = () => null;

// ── Token shorthand — reads CSS vars at runtime ──────────────────────
export const cv = (name) => `var(--c-${name})`;
export const C = {
  get primary()      { return cv("primary"); },
  get primaryDark()  { return cv("primary-dk"); },
  get primaryLt()    { return cv("primary-lt"); },
  get primaryXlt()   { return cv("primary-xlt"); },
  get bg()           { return cv("bg"); },
  get surface()      { return cv("surface"); },
  get border()       { return cv("border"); },
  get text()         { return cv("text"); },
  get textMid()      { return cv("text-mid"); },
  get textLight()    { return cv("text-light"); },
  get danger()       { return cv("danger"); },
  get dangerLt()     { return cv("danger-lt"); },
  get success()      { return cv("success"); },
  get successLt()    { return cv("success-lt"); },
  get warning()      { return cv("warning"); },
  get warningLt()    { return cv("warning-lt"); },
  get info()         { return cv("info"); },
  get infoLt()       { return cv("info-lt"); },
  get sidebarBg()    { return cv("sidebar-bg"); },
  get sidebarBorder(){ return cv("sidebar-border"); },
};
export const F = "'Montserrat', 'Inter', system-ui, sans-serif";

// ── Toast ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, add, remove };
}

export function Toast({ toasts, remove }) {
  const cols  = { error: C.danger, success: C.success, info: C.primary, warning: C.warning };
  const icons = { error: "fa-circle-xmark", success: "fa-circle-check", info: "fa-circle-info", warning: "fa-triangle-exclamation" };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: cols[t.type], color: "#fff", padding: "11px 16px", borderRadius: 8, fontFamily: F, fontSize: "0.82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 9, minWidth: 260, maxWidth: 360, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          <i className={`fa-solid ${icons[t.type]}`} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, opacity: 0.8, padding: 0 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────
export function Field({ label, type = "text", value, onChange, placeholder, rightEl, as = "input", rows = 4, required, helper, disabled }) {
  const [focused, setFocused] = useState(false);
  const base = { width: "100%", padding: rightEl ? "8px 36px 8px 10px" : "8px 10px", borderRadius: 6, border: `1.5px solid ${focused ? C.primary : C.border}`, outline: "none", fontFamily: F, fontSize: "0.875rem", color: C.text, background: disabled ? C.bg : C.surface, boxSizing: "border-box", transition: "border-color 0.18s" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{label}{required && <span style={{ color: C.danger, marginLeft: 3 }}>*</span>}</label>}
      <div style={{ position: "relative" }}>
        {as === "textarea"
          ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...base, resize: "vertical", minHeight: 80 }} />
          : <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />}
        {rightEl && <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
      </div>
      {helper && <p style={{ fontSize: "0.7rem", color: C.textLight, margin: 0, fontFamily: F }}>{helper}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{label}</label>}
      <select value={value} onChange={onChange} style={{ padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.875rem", background: C.surface, color: C.text, cursor: "pointer", outline: "none" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────
export function Btn({ loading, label, onClick, type = "button", variant = "primary", icon, size = "md", style: extra = {}, disabled }) {
  const [hov, setHov] = useState(false);
  const sizes = { sm: { padding: "5px 12px", fontSize: "0.75rem" }, md: { padding: "7px 16px", fontSize: "0.82rem" }, lg: { padding: "10px 22px", fontSize: "0.88rem" } };
  const vars = {
    primary: { background: disabled || loading ? C.primaryLt : hov ? C.primaryDark : C.primary, color: "#fff", border: "none" },
    danger:  { background: hov ? "#a93226" : C.danger, color: "#fff", border: "none" },
    ghost:   { background: hov ? C.primaryXlt : "transparent", color: C.primary, border: `1.5px solid ${C.border}` },
    light:   { background: hov ? C.primaryXlt : C.bg, color: C.textMid, border: `1.5px solid ${C.border}` },
  };
  return (
    <button type={type} disabled={loading || disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 6, cursor: loading || disabled ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: F, letterSpacing: "0.02em", transition: "background 0.15s", opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap", ...sizes[size], ...vars[variant], ...extra }}>
      {loading ? <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} /> : icon && <i className={`fa-solid ${icon}`} style={{ fontSize: "0.85em" }} />}
      {label}
    </button>
  );
}

// ── Icon Button ───────────────────────────────────────────────────────
export function IconBtn({ icon, onClick, title, color }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title} type="button"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.primaryXlt : "none", border: "none", cursor: "pointer", color: hov ? C.primary : (color || C.textLight), fontSize: "0.85rem", padding: "5px 7px", borderRadius: 5, transition: "all 0.15s" }}>
      <i className={`fa-solid ${icon}`} />
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 540 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 10, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.surface, zIndex: 1 }}>
          <h2 style={{ fontFamily: F, fontWeight: 700, color: C.text, margin: 0, fontSize: "0.95rem" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: C.textLight }}>×</button>
        </div>
        <div style={{ padding: "18px 20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Confirm ───────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = "Delete" }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}>
      <p style={{ color: C.textMid, fontSize: "0.875rem", lineHeight: 1.6, marginTop: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn label="Cancel" variant="ghost" onClick={onClose} />
        <Btn label={confirmLabel} variant="danger" onClick={onConfirm} />
      </div>
    </Modal>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ label, color = "brown" }) {
  const map = { brown: { bg: C.primaryXlt, text: C.primary }, green: { bg: C.successLt, text: C.success }, red: { bg: C.dangerLt, text: C.danger }, blue: { bg: C.infoLt, text: C.info }, gray: { bg: C.bg, text: C.textLight }, orange: { bg: C.warningLt, text: C.warning } };
  const c = map[color] || map.brown;
  return <span style={{ background: c.bg, color: c.text, padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600, fontFamily: F, whiteSpace: "nowrap" }}>{label}</span>;
}

export function StatusBadge({ status, visible }) {
  if (!visible) return <Badge label="Hidden" color="gray" />;
  return status === "published" ? <Badge label="Published" color="green" /> : <Badge label="Draft" color="orange" />;
}

// ── Pill Input with autocomplete ──────────────────────────────────────
export function PillInput({ label, value = [], onChange, placeholder, suggestions = [], onNewItem }) {
  const [input, setInput]     = useState("");
  const [showSug, setShowSug] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 8);

  const add = async (v) => {
    const trimmed = v.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
      if (!suggestions.includes(trimmed) && onNewItem) {
        try { await onNewItem(trimmed); } catch {}
      }
    }
    setInput(""); setShowSug(false);
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const handleKey = (e) => {
    if (e.key === "Enter")     { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && value.length) remove(value.length - 1);
    if (e.key === "Escape")    setShowSug(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
      {label && <label style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{label}</label>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "7px 8px", border: `1.5px solid ${C.border}`, borderRadius: 6, background: C.surface, minHeight: 38, cursor: "text" }}
        onClick={e => { e.currentTarget.querySelector("input")?.focus(); setShowSug(true); }}>
        {value.map((v, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.primaryXlt, color: C.primary, padding: "2px 8px 2px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 500, border: `1px solid ${C.border}` }}>
            {v}
            <button type="button" onClick={e => { e.stopPropagation(); remove(i); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: "0.75rem", lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </span>
        ))}
        <input value={input} onChange={e => { setInput(e.target.value); setShowSug(true); }} onKeyDown={handleKey}
          onFocus={() => setShowSug(true)} onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={value.length ? "" : (placeholder || "Type and press Enter…")}
          style={{ border: "none", outline: "none", fontFamily: F, fontSize: "0.82rem", color: C.text, minWidth: 120, flex: 1, padding: "1px 0", background: "transparent" }} />
      </div>
      {showSug && (filtered.length > 0 || input.trim()) && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden", marginTop: 2 }}>
          {filtered.map((s, i) => (
            <div key={i} onMouseDown={() => add(s)} style={{ padding: "8px 12px", cursor: "pointer", fontFamily: F, fontSize: "0.82rem", color: C.text }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {s}
            </div>
          ))}
          {input.trim() && !suggestions.includes(input.trim()) && (
            <div onMouseDown={() => add(input)} style={{ padding: "8px 12px", cursor: "pointer", fontFamily: F, fontSize: "0.82rem", color: C.primary, borderTop: `1px solid ${C.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = C.primaryXlt}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />Create "{input.trim()}"
            </div>
          )}
        </div>
      )}
      <p style={{ fontSize: "0.68rem", color: C.textLight, margin: 0, fontFamily: F }}>Press Enter to add · Backspace removes last</p>
    </div>
  );
}

// ── Rich Text / HTML Editor field ─────────────────────────────────────
export function RichField({ label, value, onChange, rows = 6 }) {
  const [mode, setMode] = useState("text");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {label && <label style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: F }}>{label}</label>}
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 5, overflow: "hidden" }}>
          {["text", "html"].map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{ padding: "3px 10px", border: "none", background: mode === m ? C.primary : C.surface, color: mode === m ? "#fff" : C.textLight, fontFamily: F, fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {m}
            </button>
          ))}
        </div>
      </div>
      {mode === "html" ? (
        <textarea value={value} onChange={onChange} rows={rows} placeholder="<p>Enter HTML here…</p>"
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, outline: "none", fontFamily: "monospace", fontSize: "0.82rem", color: C.text, background: C.surface, resize: "vertical", minHeight: 100, boxSizing: "border-box" }} />
      ) : (
        <textarea value={value} onChange={onChange} rows={rows} placeholder="Enter plain text description…"
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, outline: "none", fontFamily: F, fontSize: "0.875rem", color: C.text, background: C.surface, resize: "vertical", minHeight: 100, boxSizing: "border-box" }} />
      )}
      {mode === "html" && value && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", background: C.bg, fontSize: "0.82rem", color: C.textMid, lineHeight: 1.7 }}>
          <p style={{ fontSize: "0.65rem", color: C.textLight, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────────────────
export function ImageUploader({ onUpload, label = "Upload Image", multiple = false, uploading = false }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();
  const handleFiles = (files) => { if (!files?.length) return; onUpload(multiple ? Array.from(files) : files[0]); };
  return (
    <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => !uploading && ref.current?.click()}
      style={{ border: `2px dashed ${dragging ? C.primary : C.border}`, borderRadius: 8, padding: "14px 12px", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer", background: dragging ? C.primaryXlt : C.bg, transition: "all 0.2s" }}>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} style={{ display: "none" }} onChange={e => handleFiles(multiple ? e.target.files : e.target.files[0])} />
      {uploading
        ? <><i className="fa-solid fa-spinner" style={{ color: C.primary, fontSize: "1.1rem", animation: "spin 1s linear infinite" }} /><p style={{ fontSize: "0.75rem", color: C.textLight, margin: "5px 0 0", fontFamily: F }}>Uploading…</p></>
        : <><i className="fa-solid fa-cloud-arrow-up" style={{ color: C.primary, fontSize: "1.2rem" }} /><p style={{ fontSize: "0.75rem", color: C.textLight, margin: "5px 0 0", fontFamily: F }}>{label}</p></>
      }
    </div>
  );
}

// ── Image Strip ───────────────────────────────────────────────────────
export function ImageStrip({ images = [], onRemove }) {
  if (!images.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {images.map((url, i) => (
        <div key={i} style={{ position: "relative", width: 76, height: 76, borderRadius: 7, overflow: "hidden", border: `1px solid ${C.border}`, flexShrink: 0 }}>
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {onRemove && (
            <button type="button" onClick={() => onRemove(i)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", color: "#fff", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────
export function Toggle({ label, checked, onChange, helper }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 20, background: checked ? C.primary : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      <div>
        {label && <span style={{ fontFamily: F, fontSize: "0.82rem", fontWeight: 500, color: C.text }}>{label}</span>}
        {helper && <p style={{ fontFamily: F, fontSize: "0.7rem", color: C.textLight, margin: "1px 0 0" }}>{helper}</p>}
      </div>
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────
export function Checkbox({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 16, height: 16, border: `2px solid ${checked ? C.primary : C.border}`, borderRadius: 3, background: checked ? C.primary : C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
      {checked && <i className="fa-solid fa-check" style={{ color: "#fff", fontSize: "0.6rem" }} />}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ w = "100%", h = 16, r = 4, style: extra }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: `linear-gradient(90deg, ${C.border} 25%, ${C.bg} 50%, ${C.border} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", ...extra }} />;
}

// ── Page Shell ────────────────────────────────────────────────────────
export function PageShell({ title, subtitle, action, children, toolbar }) {
  return (
    <div style={{ padding: "20px 24px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: toolbar ? 12 : 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: F, fontWeight: 700, color: C.text, margin: 0, fontSize: "1.2rem" }}>{title}</h1>
          {subtitle && <p style={{ color: C.textLight, margin: "3px 0 0", fontSize: "0.75rem", fontFamily: F }}>{subtitle}</p>}
        </div>
        {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
      </div>
      {toolbar && <div style={{ marginBottom: 12 }}>{toolbar}</div>}
      {children}
    </div>
  );
}

// ── Section Divider ───────────────────────────────────────────────────
export function SectionLabel({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 8px" }}>
      <span style={{ fontFamily: F, fontSize: "0.65rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────
export function Card({ children, style: extra = {} }) {
  return <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, ...extra }}>{children}</div>;
}

// ── Empty State ───────────────────────────────────────────────────────
export function EmptyState({ icon = "fa-box-open", title, message, action }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <i className={`fa-solid ${icon}`} style={{ fontSize: "2rem", color: C.border, marginBottom: 12 }} />
      <h3 style={{ fontFamily: F, color: C.textMid, fontWeight: 600, margin: "0 0 5px", fontSize: "0.9rem" }}>{title}</h3>
      {message && <p style={{ fontFamily: F, fontSize: "0.8rem", margin: "0 0 14px", color: C.textLight, lineHeight: 1.5 }}>{message}</p>}
      {action}
    </div>
  );
}

// ── Offline Banner ────────────────────────────────────────────────────
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, background: C.danger, color: "#fff", textAlign: "center", padding: "8px 16px", fontFamily: F, fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <i className="fa-solid fa-wifi" style={{ opacity: 0.6 }} />
      You are offline — changes will not be saved until your connection is restored
    </div>
  );
}
