// src/Administrator/Products.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabase";

const FRONT_URL = process.env.REACT_APP_FRONT_URL || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function formsEqual(a, b) {
  for (const k of Object.keys(EMPTY_FORM)) {
    const av = a[k], bv = b[k];
    if (Array.isArray(av) && Array.isArray(bv)) {
      if (JSON.stringify(av) !== JSON.stringify(bv)) return false;
    } else if (av !== bv) return false;
  }
  return true;
}

const EMPTY_FORM = {
  name: "", slug: "", short_description: "", description: "",
  thumbnail: "", images: [], spec_images: [], files: [],
  categories: [], tags: [], features: [],
  brand: "", type: "",
  status: "published",
  visible: true, featured: false, sort_order: 0,
};

// ─── WebP conversion + resize before upload ───────────────────────────────────
// Converts any image File to a WebP Blob at up to WEBP_MAX_DIM px on the long side.
// Quality 0.82 gives excellent visuals at ~60-70% of equivalent JPEG size.
const WEBP_QUALITY = 0.82;
const WEBP_MAX_DIM = 1800; // px — enough for full-bleed, nothing wasteful

function convertToWebP(file, maxDim = WEBP_MAX_DIM, quality = WEBP_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Downscale if needed, preserve aspect ratio
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height / width) * maxDim);
          width  = maxDim;
        } else {
          width  = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("WebP conversion failed")),
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    img.src = objectUrl;
  });
}

// ─── Upload with automatic WebP conversion ────────────────────────────────────
async function uploadFileToSupabase(file, bucket = "product-images") {
  let uploadBlob;
  let fileName;

  if (file.type.startsWith("image/")) {
    // Convert image → WebP
    try {
      uploadBlob = await convertToWebP(file);
      fileName   = `${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
    } catch (err) {
      // Fallback: upload original if conversion fails
      console.warn("WebP conversion failed, uploading original:", err);
      uploadBlob = file;
      const ext  = file.name.split(".").pop();
      fileName   = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    }
  } else {
    // Non-image (PDF etc.) — upload as-is
    uploadBlob = file;
    const ext  = file.name.split(".").pop();
    fileName   = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  }

  const contentType = file.type.startsWith("image/") ? "image/webp" : file.type;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, uploadBlob, { cacheControl: "3600", upsert: false, contentType });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── Extract bucket + path from a Supabase public URL ─────────────────────────
// e.g. "https://<proj>.supabase.co/storage/v1/object/public/product-images/abc.webp"
// → { bucket: "product-images", path: "abc.webp" }
function parseStorageUrl(url) {
  if (!url) return null;
  try {
    const clean = url.split("?")[0]; // strip transform params
    const match = clean.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) return null;
    return { bucket: match[1], path: match[2] };
  } catch {
    return null;
  }
}

// ─── Delete a set of URLs from storage (best-effort, grouped by bucket) ───────
async function deleteStorageUrls(urls = []) {
  const byBucket = {};
  for (const url of urls) {
    const parsed = parseStorageUrl(url);
    if (!parsed) continue;
    (byBucket[parsed.bucket] = byBucket[parsed.bucket] || []).push(parsed.path);
  }
  await Promise.allSettled(
    Object.entries(byBucket).map(([bucket, paths]) =>
      supabase.storage.from(bucket).remove(paths)
    )
  );
}

// ─── Delete ALL storage assets tied to a product row ──────────────────────────
async function deleteProductStorageFiles(product) {
  const urls = [
    product.thumbnail,
    ...(product.images      || []),
    ...(product.spec_images || []),
    ...(product.files       || []).map(f => f?.url),
  ].filter(Boolean);
  await deleteStorageUrls(urls);
}

// ─── Find URLs present in `savedForm` but removed in `currentForm` ────────────
// These are orphans — the user deleted or replaced them during editing.
// Only URLs that actually live in our Supabase storage buckets are returned.
function findOrphanedUrls(savedForm, currentForm) {
  const collect = f => [
    f.thumbnail,
    ...(f.images      || []),
    ...(f.spec_images || []),
    ...(f.files       || []).map(fi => fi?.url),
  ].filter(Boolean).filter(url => parseStorageUrl(url) !== null);

  const savedSet   = new Set(collect(savedForm));
  const currentSet = new Set(collect(currentForm));

  return [...savedSet].filter(url => !currentSet.has(url));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  };
  const remove = id => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, add, remove };
}

function Toast({ toasts, remove }) {
  const icons = { error: "fa-circle-xmark", success: "fa-circle-check", info: "fa-circle-info", warning: "fa-triangle-exclamation" };
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <i className={`fa-solid ${icons[t.type]}`} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}></button>
        </div>
      ))}
    </div>
  );
}

function Btn({ loading, label, onClick, type = "button", variant = "primary", icon, size, style: extra = {}, disabled }) {
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : ""].filter(Boolean).join(" ");
  return (
    <button type={type} disabled={loading || disabled} onClick={onClick} className={cls} style={extra}>
      {loading
        ? <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} />
        : icon && <i className={`fa-solid ${icon}`} style={{ fontSize: "0.85em" }} />
      }
      {label}
    </button>
  );
}

function IconBtn({ icon, onClick, title, danger }) {
  return (
    <button type="button" onClick={onClick} title={title} className={`icon-btn${danger ? " danger" : ""}`}>
      <i className={`fa-solid ${icon}`} />
    </button>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal${wide ? " modal-wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = "Delete" }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="confirm-msg">{message}</p>
      <div className="confirm-actions">
        <Btn label="Cancel" variant="ghost" onClick={onClose} />
        <Btn label={confirmLabel} variant="danger" onClick={onConfirm} />
      </div>
    </Modal>
  );
}

function SectionLabel({ label }) {
  return <div className="section-label"><span>{label}</span></div>;
}

function Field({ label, type = "text", value, onChange, placeholder, required, helper, disabled }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {label && (
        <label className="form-label">
          {label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required} disabled={disabled}
        className="form-input"
      />
      {helper && <p className="form-helper">{helper}</p>}
    </div>
  );
}

function RichField({ label, value, onChange, rows = 6 }) {
  const [mode, setMode] = useState("text");
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <div className="rich-field-header">
        {label && <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>}
        <div className="rich-field-modes">
          {["text", "html"].map(m => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rich-field-mode-btn${mode === m ? " active" : ""}`}>{m}</button>
          ))}
        </div>
      </div>
      <textarea
        value={value} onChange={onChange} rows={rows}
        placeholder={mode === "html" ? "<p>Enter HTML here...</p>" : "Enter plain text description..."}
        className="form-textarea"
        style={{ fontFamily: mode === "html" ? "monospace" : "var(--font)", marginTop: 4 }}
      />
      {mode === "html" && value && (
        <div className="rich-field-preview">
          <p className="rich-field-preview-label">Preview</p>
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {label && <label className="form-label">{label}</label>}
      <select value={value} onChange={onChange} className="form-select">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange, helper }) {
  return (
    <div className="toggle-row">
      <div className={`toggle-track${checked ? " on" : ""}`} onClick={() => onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
      <div>
        {label && <div className="toggle-label">{label}</div>}
        {helper && <div className="toggle-helper">{helper}</div>}
      </div>
    </div>
  );
}

function PillInput({ label, value = [], onChange, placeholder, suggestions = [] }) {
  const [input, setInput]     = useState("");
  const [showSug, setShowSug] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 8);
  const add = v => { const t = v.trim(); if (!t || value.includes(t)) return; onChange([...value, t]); setInput(""); setShowSug(false); };
  const remove = i => onChange(value.filter((_, idx) => idx !== i));
  const handleKey = e => {
    if (e.key === "Enter")    { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && value.length) remove(value.length - 1);
    if (e.key === "Escape")   setShowSug(false);
  };
  return (
    <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
      {label && <label className="form-label">{label}</label>}
      <div className="pill-input-wrap" onClick={e => { e.currentTarget.querySelector("input")?.focus(); setShowSug(true); }}>
        {value.map((v, i) => (
          <span key={i} className="pill-item">
            {v}
            <button type="button" onClick={e => { e.stopPropagation(); remove(i); }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </span>
        ))}
        <input
          value={input} onChange={e => { setInput(e.target.value); setShowSug(true); }}
          onKeyDown={handleKey} onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={value.length ? "" : (placeholder || "Type and press Enter...")}
          className="pill-input-field"
        />
      </div>
      {showSug && (filtered.length > 0 || input.trim()) && (
        <div className="pill-suggestions">
          {filtered.map((s, i) => (
            <div key={i} className="pill-suggestion-item" onMouseDown={() => add(s)}>{s}</div>
          ))}
          {input.trim() && !value.includes(input.trim()) && (
            <div className="pill-suggestion-item pill-suggestion-create" onMouseDown={() => add(input)}>
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />Create "{input.trim()}"
            </div>
          )}
        </div>
      )}
      <p className="pill-hint">Press Enter to add items, Backspace to remove the last item</p>
    </div>
  );
}

function ImageStrip({ images = [], onRemove }) {
  if (!images.length) return null;
  return (
    <div className="image-strip">
      {images.map((url, i) => (
        <div key={i} className="image-strip-item">
          <img src={url} alt="" />
          {onRemove && (
            <button type="button" className="image-strip-remove" onClick={() => onRemove(i)}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ImageUploader({ onUpload, label = "Upload Image", multiple = false, uploading = false }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();
  const handleFiles = files => { if (!files?.length) return; onUpload(multiple ? Array.from(files) : files[0]); };
  return (
    <div
      className={`img-upload-zone${dragging ? " dragging" : ""}${uploading ? " disabled" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => !uploading && ref.current?.click()}
    >
      <input ref={ref} type="file" accept="image/*" multiple={multiple} style={{ display: "none" }}
        onChange={e => handleFiles(multiple ? e.target.files : e.target.files[0])} />
      {uploading
        ? <><i className="fa-solid fa-spinner" style={{ color: "var(--brand)", fontSize: "1.1rem", animation: "spin 1s linear infinite" }} /><p style={{ fontSize: "0.75rem", color: "var(--text-3)", margin: "5px 0 0" }}>Converting &amp; uploading…</p></>
        : <><i className="fa-solid fa-cloud-arrow-up" style={{ color: "var(--brand)", fontSize: "1.2rem" }} /><p style={{ fontSize: "0.75rem", color: "var(--text-3)", margin: "5px 0 0" }}>{label}</p></>
      }
    </div>
  );
}

function ThumbnailUploader({ onUpload, uploading }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();
  const handleFiles = files => {
    const file = files instanceof FileList ? files[0] : (Array.isArray(files) ? files[0] : files);
    if (file) onUpload(file);
  };
  return (
    <div
      className={`thumb-upload-zone${dragging ? " dragging" : ""}${uploading ? " disabled" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => !uploading && ref.current?.click()}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files[0]) { handleFiles(e.target.files[0]); e.target.value = ""; } }} />
      {uploading ? (
        <>
          <i className="fa-solid fa-spinner" style={{ color: "var(--brand)", fontSize: "1.8rem", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Converting &amp; uploading…</span>
        </>
      ) : (
        <>
          <div className="thumb-upload-icon"><i className="fa-solid fa-image" /></div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", margin: "0 0 4px" }}>Add Featured Image</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", margin: 0 }}>Click to browse or drag &amp; drop · auto-converted to WebP</p>
          </div>
          <div className="thumb-upload-cta">
            <i className="fa-solid fa-arrow-up-from-bracket" /> Choose Image
          </div>
        </>
      )}
    </div>
  );
}

function FileRow({ file, index, onRemove, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(file.name);
  return (
    <div className="file-row">
      <div className="file-row-icon"><i className="fa-solid fa-file-pdf" /></div>
      <div className="file-row-info">
        {editing ? (
          <input value={name} onChange={e => setName(e.target.value)} autoFocus className="file-row-input"
            onBlur={() => { onRename(index, name); setEditing(false); }}
            onKeyDown={e => { if (e.key === "Enter") { onRename(index, name); setEditing(false); } }} />
        ) : (
          <div className="file-row-name">{file.name}</div>
        )}
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-row-url">
          {file.url ? file.url.split("/").pop() : ""}
        </a>
      </div>
      <button type="button" onClick={() => setEditing(true)} title="Rename" className="file-row-btn file-row-edit">
        <i className="fa-solid fa-pen" />
      </button>
      <button type="button" onClick={() => onRemove(index)} title="Remove" className="file-row-btn file-row-trash">
        <i className="fa-solid fa-trash" />
      </button>
    </div>
  );
}

function UnsavedConfirm({ open, onStay, onDiscard }) {
  if (!open) return null;
  return (
    <div className="unsaved-overlay">
      <div className="unsaved-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div className="unsaved-icon">
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#e6a817", fontSize: "1rem" }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "0.98rem", color: "var(--text)", margin: 0 }}>Unsaved Changes</h3>
        </div>
        <p style={{ fontSize: "0.83rem", color: "var(--text-2)", margin: "0 0 20px", lineHeight: 1.6 }}>
          You have unsaved changes. If you leave now your progress will be lost.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn label="Stay & Keep Editing" variant="ghost" onClick={onStay} />
          <Btn label="Discard" variant="danger" icon="fa-trash" onClick={onDiscard} />
        </div>
      </div>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function ProductCard({ p, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    if (!menuOpen) return;
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const productUrl = `${FRONT_URL || window.location.origin}/products/${p.slug}`;

  return (
    <div
      className="product-grid-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      <div className="product-grid-thumb">
        {p.thumbnail
          ? <img src={p.thumbnail} alt={p.name} />
          : <i className="fa-regular fa-image" style={{ fontSize: "1.5rem", color: "var(--border)" }} />
        }
        {hovered && (
          <div className="product-grid-options" ref={menuRef}>
            <button
              type="button"
              className="product-grid-opts-btn"
              onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
            >
              <i className="fa-solid fa-ellipsis-vertical" />
            </button>
            {menuOpen && (
              <div className="product-grid-menu">
                <button type="button" onClick={() => { setMenuOpen(false); onEdit(p); }}>
                  <i className="fa-solid fa-pen" /> Edit
                </button>
                <button type="button" className="danger" onClick={() => { setMenuOpen(false); onDelete(p); }}>
                  <i className="fa-solid fa-trash" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="product-grid-info">
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="product-grid-name product-name-link"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {p.name}
        </a>
        {(p.categories || []).length > 0 && (
          <div className="product-grid-pills">
            {(p.categories || []).slice(0, 2).map(c => (
              <span key={c} className="tbl-pill tbl-pill-cat">{c}</span>
            ))}
          </div>
        )}
        {(p.tags || []).length > 0 && (
          <div className="product-grid-pills">
            {(p.tags || []).slice(0, 3).map(t => (
              <span key={t} className="tbl-pill tbl-pill-tag">{t}</span>
            ))}
            {(p.tags || []).length > 3 && (
              <span className="tbl-pill tbl-pill-more">+{p.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Products({ currentUser }) {
  const { toasts, add, remove } = useToast();

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [allCats, setAllCats]           = useState([]);
  const [allTags, setAllTags]           = useState([]);

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortDir, setSortDir]           = useState("desc");
  const [viewMode, setViewMode]         = useState("list");

  const [selected, setSelected]         = useState(new Set());
  const [bulkConfirm, setBulkConfirm]   = useState(false);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  // savedForm = exact snapshot of the product when the modal opened.
  // Used for: (1) dirty-check, (2) detecting orphaned storage files on save.
  const [savedForm, setSavedForm]       = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited]     = useState(false);
  const [saving, setSaving]             = useState(false);

  const [unsavedOpen, setUnsavedOpen]   = useState(false);
  const pendingClose = useRef(null);

  const [confirmDel, setConfirmDel]     = useState(null);

  const [upThumb, setUpThumb]   = useState(false);
  const [upImgs,  setUpImgs]    = useState(false);
  const [upSpec,  setUpSpec]    = useState(false);
  const [upFile,  setUpFile]    = useState(false);

  const fileInputRef = useRef();
  const isDirty = !formsEqual(form, savedForm);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("products")
        .select("id,name,slug,brand,type,status,visible,featured,thumbnail,categories,tags,files,images,spec_images,created_at,updated_at,created_by_username")
        .order("created_at", { ascending: sortDir === "asc" });
      if (filterStatus) q = q.eq("status", filterStatus);
      const { data, error } = await q;
      if (error) throw error;
      setProducts(data || []);
      setSelected(new Set());
    } catch (err) { add(err.message, "error"); }
    finally { setLoading(false); }
  }, [filterStatus, sortDir]); // eslint-disable-line

  const fetchMeta = useCallback(async () => {
    const [{ data: cats }, { data: tags }] = await Promise.all([
      supabase.from("categories").select("name"),
      supabase.from("tags").select("name"),
    ]);
    setAllCats((cats || []).map(c => c.name));
    setAllTags((tags || []).map(t => t.name));
  }, []);

  useEffect(() => { fetchProducts(); fetchMeta(); }, [fetchProducts, fetchMeta]);

  const upsertTaxonomy = async (items, table) => {
    if (!items.length) return;
    const rows = items.map(name => ({ name, slug: slugify(name) }));
    await supabase.from(table).upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  };

  // ── Image uploads (all auto-converted to WebP) ─────────────────────────────
  const handleThumbUpload = async file => {
    setUpThumb(true);
    try {
      const url = await uploadFileToSupabase(file, "product-images");
      setForm(f => ({ ...f, thumbnail: url }));
      add("Thumbnail converted to WebP and uploaded.", "success");
    } catch (err) { add(err.message, "error"); }
    finally { setUpThumb(false); }
  };

  const uploadMoreImages = async files => {
    setUpImgs(true);
    try {
      const arr = Array.isArray(files) ? files : [files];
      const urls = await Promise.all(arr.map(f => uploadFileToSupabase(f, "product-images")));
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      add(`${urls.length} image(s) converted to WebP and uploaded.`, "success");
    } catch (err) { add(err.message, "error"); }
    finally { setUpImgs(false); }
  };

  const uploadSpecImages = async files => {
    setUpSpec(true);
    try {
      const arr = Array.isArray(files) ? files : [files];
      const urls = await Promise.all(arr.map(f => uploadFileToSupabase(f, "product-images")));
      setForm(f => ({ ...f, spec_images: [...f.spec_images, ...urls] }));
      add(`${urls.length} spec image(s) converted to WebP and uploaded.`, "success");
    } catch (err) { add(err.message, "error"); }
    finally { setUpSpec(false); }
  };

  const handleFileUpload = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUpFile(true);
    try {
      for (const file of files) {
        const url = await uploadFileToSupabase(file, "product-pdf");
        const rawName = file.name.replace(/\.pdf$/i, "");
        const displayName = rawName.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        setForm(f => ({ ...f, files: [...f.files, { name: displayName, url }] }));
      }
      add(`${files.length} file(s) uploaded.`, "success");
    } catch (err) {
      add("PDF upload failed: " + err.message, "error");
    } finally {
      setUpFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const renameFile = (i, name) => setForm(f => ({ ...f, files: f.files.map((fi, idx) => idx === i ? { ...fi, name } : fi) }));
  const removeFile = i => setForm(f => ({ ...f, files: f.files.filter((_, idx) => idx !== i) }));

  // ── Modal guard ────────────────────────────────────────────────────────────
  const actualClose = () => { setModalOpen(false); setEditing(null); setUnsavedOpen(false); pendingClose.current = null; };
  const handleModalClose = () => { if (isDirty) { pendingClose.current = actualClose; setUnsavedOpen(true); } else actualClose(); };
  const closeModal = useCallback(() => { if (isDirty) { pendingClose.current = actualClose; setUnsavedOpen(true); } else actualClose(); }, [isDirty]); // eslint-disable-line
  const handleUnsavedStay    = () => { setUnsavedOpen(false); pendingClose.current = null; };
  const handleUnsavedDiscard = () => { actualClose(); };

  // ── Open add / edit ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setSavedForm(EMPTY_FORM);
    setSlugEdited(false); setModalOpen(true);
  };

  const openEdit = async row => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", row.id).single();
      if (error) throw error;
      const loaded = {
        name:              data.name || "",
        slug:              data.slug || "",
        short_description: data.short_description || "",
        description:       data.description || "",
        thumbnail:         data.thumbnail || "",
        images:            data.images || [],
        spec_images:       data.spec_images || [],
        files:             data.files || [],
        categories:        data.categories || [],
        tags:              data.tags || [],
        features:          data.features || [],
        brand:             data.brand || "",
        type:              data.type || "",
        status:            data.status || "published",
        visible:           data.visible !== false,
        featured:          data.featured || false,
        sort_order:        data.sort_order || 0,
      };
      setForm(loaded);
      // Keep a clean snapshot — this is our reference for orphan detection on save
      setSavedForm(loaded);
      setSlugEdited(true);
      setEditing(row);
      setModalOpen(true);
    } catch (err) { add(err.message, "error"); }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async e => {
    e.preventDefault();
    if (!form.name) return add("Product name is required.", "error");
    if (!form.slug) return add("Slug is required.", "error");
    setSaving(true);
    try {
      await upsertTaxonomy(form.categories, "categories");
      await upsertTaxonomy(form.tags, "tags");
      fetchMeta();

      const payload = {
        name:              form.name.trim(),
        slug:              form.slug.trim(),
        short_description: form.short_description.trim() || null,
        description:       form.description.trim() || null,
        thumbnail:         form.thumbnail || null,
        images:            form.images,
        spec_images:       form.spec_images,
        files:             form.files,
        categories:        form.categories,
        tags:              form.tags,
        features:          form.features,
        brand:             form.brand.trim() || null,
        type:              form.type.trim() || null,
        status:            form.status,
        visible:           form.visible,
        featured:          form.featured,
        sort_order:        form.sort_order,
        ...(currentUser && !editing ? { created_by_username: currentUser.username } : {}),
      };

      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;

        // ── Orphan cleanup ────────────────────────────────────────────────────
        // Any URL that was in savedForm (the DB snapshot on open) but is no
        // longer in the current form was deliberately removed by the user —
        // either deleted from the strip, replaced by a new upload, or had the
        // thumbnail cleared. We delete those files from storage now so they
        // don't accumulate as dead weight in the bucket.
        const orphans = findOrphanedUrls(savedForm, form);
        if (orphans.length) {
          await deleteStorageUrls(orphans);
          console.info(`[Products] Removed ${orphans.length} orphaned file(s) from storage.`);
        }
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }

      add(editing ? "Product saved." : "Product created.", "success");
      actualClose();
      fetchProducts();
    } catch (err) { add(err.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Delete single ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const target = confirmDel;
    setConfirmDel(null);
    try {
      const { data: fullProduct, error: fetchErr } = await supabase
        .from("products").select("*").eq("id", target.id).single();
      if (fetchErr) throw fetchErr;

      const { error: delErr } = await supabase.from("products").delete().eq("id", target.id);
      if (delErr) throw delErr;

      await deleteProductStorageFiles(fullProduct);
      add("Product and associated files deleted.", "success");
    } catch (err) { add(err.message, "error"); }
    finally { fetchProducts(); }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setBulkConfirm(false);
    try {
      const { data: fullProducts, error: fetchErr } = await supabase
        .from("products").select("*").in("id", ids);
      if (fetchErr) throw fetchErr;

      const { error: delErr } = await supabase.from("products").delete().in("id", ids);
      if (delErr) throw delErr;

      await Promise.allSettled((fullProducts || []).map(p => deleteProductStorageFiles(p)));
      add(`${ids.length} product(s) and their files deleted.`, "success");
    } catch (err) { add(err.message, "error"); }
    finally { setSelected(new Set()); fetchProducts(); }
  };

  const toggleSelect = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      (p.categories || []).some(c => c.toLowerCase().includes(q)) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  const handleNameChange = e => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: slugEdited ? f.slug : slugify(name) }));
  };

  const productUrl = slug => `${FRONT_URL || window.location.origin}/products/${slug}`;

  const formatDate = d => d
    ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
    : "-";

  return (
    <div className="products-page">
      <Toast toasts={toasts} remove={remove} />
      <UnsavedConfirm open={unsavedOpen} onStay={handleUnsavedStay} onDiscard={handleUnsavedDiscard} />

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="page-title">
            <i className="fa-solid fa-box" style={{ marginRight: "0.5rem", color: "var(--brand)" }} />
            Products
          </h1>
          <p className="products-subtitle">
            {loading ? "Loading..." : `${filtered.length} of ${products.length} products`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            className="search-input"
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, brand, tag..."
          />
        </div>

        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select className="filter-select" value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        <div className="view-toggle">
          {[{ mode: "list", icon: "fa-list" }, { mode: "grid", icon: "fa-grip" }].map(({ mode, icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`view-toggle-btn${viewMode === mode ? " active" : ""}`}
            >
              <i className={`fa-solid ${icon}`} />
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <button type="button" className="btn btn-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)", gap: 5 }} onClick={() => setBulkConfirm(true)}>
            <i className="fa-solid fa-trash" /> Delete {selected.size}
          </button>
        )}

        <Btn icon="fa-plus" label="New Product" onClick={openCreate} style={{ marginLeft: "auto" }} />
      </div>

      {/* Grid View */}
      {!loading && viewMode === "grid" && (
        <div className="product-grid">
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--text-3)", fontStyle: "italic", fontSize: "0.82rem" }}>
              {search ? `No products match "${search}"` : "No products yet - click New Product to create one."}
            </div>
          )}
          {filtered.map(p => (
            <ProductCard key={p.id} p={p} onEdit={openEdit} onDelete={setConfirmDel} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="products-table-wrap">
          {loading ? (
            <div className="table-loading">
              <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} /> Loading...
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th style={{ width: 36, paddingRight: 0 }}>
                    <input
                      type="checkbox"
                      className="tbl-checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={{ width: 44 }}></th>
                  <th>Product</th>
                  <th>Categories</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      {search ? `No products match "${search}"` : "No products yet - click New Product to create one."}
                    </td>
                  </tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} className={selected.has(p.id) ? "row-selected" : ""}>
                    <td style={{ paddingRight: 0 }}>
                      <input type="checkbox" className="tbl-checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                    </td>
                    <td style={{ width: 44 }}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt="" className="product-thumb" />
                        : <div className="product-thumb-placeholder"><i className="fa-regular fa-image" /></div>
                      }
                    </td>
                    <td>
                      <a href={productUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="product-name-link">
                        {p.name}
                      </a>
                      <div className="product-meta">
                        {p.featured && (
                          <span className="product-meta-tag featured">
                            <i className="fa-solid fa-star" style={{ marginRight: 3 }} />Featured
                          </span>
                        )}
                        {(p.files || []).length > 0 && (
                          <span className="product-meta-tag files">
                            <i className="fa-solid fa-file-pdf" style={{ marginRight: 3 }} />{p.files.length} file(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {(p.categories || []).slice(0, 2).map(c => (
                          <span key={c} className="tbl-pill tbl-pill-cat">{c}</span>
                        ))}
                        {(p.categories || []).length > 2 && <span className="tbl-pill tbl-pill-more">+{p.categories.length - 2}</span>}
                        {!(p.categories || []).length && <span style={{ color: "var(--text-3)", fontSize: "0.72rem" }}>-</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {(p.tags || []).slice(0, 3).map(t => (
                          <span key={t} className="tbl-pill tbl-pill-tag">{t}</span>
                        ))}
                        {(p.tags || []).length > 3 && <span className="tbl-pill tbl-pill-more">+{p.tags.length - 3}</span>}
                        {!(p.tags || []).length && <span style={{ color: "var(--text-3)", fontSize: "0.72rem" }}>-</span>}
                      </div>
                    </td>
                    <td>
                      <span className="tbl-status">
                        {!p.visible ? "Hidden" : p.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="tbl-date">{formatDate(p.updated_at)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <IconBtn icon="fa-pen"   title="Edit"   onClick={() => openEdit(p)} />
                        <IconBtn icon="fa-trash" title="Delete" onClick={() => setConfirmDel(p)} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      <Modal open={modalOpen} onClose={handleModalClose} title={editing ? `Edit: ${editing.name}` : "New Product"} wide>
        {isDirty && (
          <div className="dirty-banner">
            <i className="fa-solid fa-circle-dot" style={{ fontSize: "0.6rem" }} />
            You have unsaved changes
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <SectionLabel label="Featured Image" />
          {form.thumbnail ? (
            <div className="thumb-preview-wrap">
              <div className="thumb-preview">
                <img src={form.thumbnail} alt="Featured" />
              </div>
              <div className="thumb-actions">
                <label className={`thumb-replace-label${upThumb ? " uploading" : ""}`}>
                  <i className="fa-solid fa-arrow-up-from-bracket" />
                  {upThumb ? "Converting & uploading…" : "Replace Image"}
                  <input type="file" accept="image/*" style={{ display: "none" }} disabled={upThumb}
                    onChange={e => { if (e.target.files[0]) { handleThumbUpload(e.target.files[0]); e.target.value = ""; } }} />
                </label>
                <button type="button" className="thumb-remove-btn" onClick={() => setForm(f => ({ ...f, thumbnail: "" }))}>
                  <i className="fa-solid fa-xmark" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <ThumbnailUploader onUpload={handleThumbUpload} uploading={upThumb} />
          )}

          <SectionLabel label="Basic Info" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Product Name" value={form.name} onChange={handleNameChange} placeholder="e.g. Nordex 9kW" required />
            <Field label="Slug" value={form.slug}
              onChange={e => { setSlugEdited(true); setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })); }}
              placeholder="nordex-9kw" required helper="Auto-generated and editable" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="SAWO" />
            <Field label="Type / Model" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Premium Series" />
          </div>
          <Field label="Short Description" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One-line summary" />
          <RichField label="Full Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <SectionLabel label="Categories & Tags" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <PillInput label="Categories" value={form.categories} onChange={v => setForm(f => ({ ...f, categories: v }))} placeholder="e.g. Wall-Mounted" suggestions={allCats} />
            <PillInput label="Tags" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="e.g. electric, 9kW" suggestions={allTags} />
          </div>
          <PillInput label="Features" value={form.features} onChange={v => setForm(f => ({ ...f, features: v }))} placeholder="e.g. Auto shutoff" />

          <SectionLabel label="Gallery Images" />
          {form.images.length > 0 ? (
            <>
              <ImageStrip images={form.images} onRemove={i => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} />
              <label className={`add-more-label${upImgs ? " uploading" : ""}`}>
                <i className="fa-solid fa-plus" />
                {upImgs ? "Converting & uploading…" : "Add More Images"}
                <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={upImgs}
                  onChange={e => e.target.files?.length && uploadMoreImages(Array.from(e.target.files))} />
              </label>
            </>
          ) : (
            <ImageUploader onUpload={uploadMoreImages} label="Upload Gallery Images (multiple) · auto-converted to WebP" multiple uploading={upImgs} />
          )}

          <SectionLabel label="Spec / Diagram Images" />
          {form.spec_images.length > 0 ? (
            <>
              <ImageStrip images={form.spec_images} onRemove={i => setForm(f => ({ ...f, spec_images: f.spec_images.filter((_, idx) => idx !== i) }))} />
              <label className={`add-more-label${upSpec ? " uploading" : ""}`}>
                <i className="fa-solid fa-plus" />
                {upSpec ? "Converting & uploading…" : "Add More Spec Images"}
                <input type="file" accept="image/*" multiple style={{ display: "none" }} disabled={upSpec}
                  onChange={e => e.target.files?.length && uploadSpecImages(Array.from(e.target.files))} />
              </label>
            </>
          ) : (
            <ImageUploader onUpload={uploadSpecImages} label="Upload Spec Images · auto-converted to WebP" multiple uploading={upSpec} />
          )}

          <SectionLabel label="Resources (PDFs - Brochures, Manuals)" />
          {form.files.length > 0 && (
            <div className="file-rows">
              {form.files.map((f, i) => (
                <FileRow key={i} file={f} index={i} onRemove={removeFile} onRename={renameFile} />
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", marginTop: form.files.length > 0 ? 8 : 0 }}>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple style={{ display: "none" }} onChange={handleFileUpload} disabled={upFile} />
            <button type="button" disabled={upFile} onClick={() => fileInputRef.current?.click()} className="pdf-upload-btn">
              {upFile
                ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} /> Uploading...</>
                : <><i className="fa-solid fa-file-arrow-up" /> Upload PDF(s)</>
              }
            </button>
            {form.files.length > 0 && <span className="pdf-file-count">{form.files.length} file(s) attached</span>}
          </div>

          <SectionLabel label="Status & Visibility" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "start" }}>
            <SelectField label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 20 }}>
              <Toggle label="Visible"  checked={form.visible}  onChange={v => setForm(f => ({ ...f, visible: v }))} helper="Show on website" />
              <Toggle label="Featured" checked={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />
            </div>
            <Field label="Sort Order" type="number" value={String(form.sort_order)}
              onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} helper="Lower = shown first" />
          </div>

          {!editing && currentUser && (
            <div className="created-by-notice">
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 6 }} />
              Will be created by <strong>@{currentUser.username}</strong>
            </div>
          )}

          <div className="modal-footer">
            <Btn label="Cancel" variant="ghost" onClick={closeModal} />
            <Btn loading={saving} label={editing ? "Save Changes" : "Create Product"} icon="fa-check" type="submit" />
          </div>
        </form>
      </Modal>

      {/* Bulk delete confirm */}
      <Confirm
        open={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected?"
        message={`Delete ${selected.size} selected product(s)? This cannot be undone. All associated images and files will also be removed.`}
        confirmLabel="Delete All"
      />

      <Confirm
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`Delete "${confirmDel?.name}"? This cannot be undone. All associated images and files will also be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}