// src/Administrator/ViewerDisplay.jsx
//
// Read-only product catalog for "viewer" role users.
// Grid-only, product name links to website, card click opens fixed modal.
//

import React, { useEffect, useState, useCallback } from "react";
import { getAllProductsLive, getAllCategoriesLive, getAllTagsLive } from "../local-storage/supabaseReader";

const FRONT_URL = process.env.REACT_APP_FRONT_URL || "";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function localOrRemote(product, field) {
  return product?.[`local_${field}`] || product?.[field] || null;
}
function productUrl(slug) {
  return `${FRONT_URL || window.location.origin}/products/${slug}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, visible }) {
  if (!visible) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:20, fontSize:"0.68rem", fontWeight:700, color:"#9a918a", background:"var(--surface-2)", border:"1px solid var(--border)" }}>
      <i className="fa-solid fa-eye-slash" style={{ fontSize:"0.6rem" }} />Hidden
    </span>
  );
  if (status === "published") return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:20, fontSize:"0.68rem", fontWeight:700, color:"#2e7d52", background:"rgba(46,125,82,0.1)", border:"1px solid rgba(46,125,82,0.25)" }}>
      <i className="fa-solid fa-circle" style={{ fontSize:"0.45rem" }} />Published
    </span>
  );
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:20, fontSize:"0.68rem", fontWeight:700, color:"#b8860b", background:"rgba(184,134,11,0.1)", border:"1px solid rgba(184,134,11,0.25)" }}>
      <i className="fa-solid fa-circle" style={{ fontSize:"0.45rem" }} />Draft
    </span>
  );
}

// ─── Full-screen Lightbox ─────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [images.length, onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.93)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}
    >
      <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:"rgba(255,255,255,0.14)", border:"none", color:"#fff", fontSize:"1rem", borderRadius:"50%", width:40, height:40, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
        <i className="fa-solid fa-xmark" />
      </button>
      {images.length > 1 && (
        <div style={{ position:"absolute", top:22, left:"50%", transform:"translateX(-50%)", background:"rgba(255,255,255,0.12)", color:"#fff", padding:"4px 14px", borderRadius:20, fontFamily:"var(--font)", fontSize:"0.72rem", fontWeight:600 }}>
          {idx + 1} / {images.length}
        </div>
      )}
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1); }} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", fontSize:"1rem", borderRadius:"50%", width:44, height:44, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}
      <img src={images[idx]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth:"88vw", maxHeight:"88vh", objectFit:"contain", borderRadius:8 }} />
      {idx < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1); }} style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", fontSize:"1rem", borderRadius:"50%", width:44, height:44, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}
      {images.length > 1 && (
        <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6 }}>
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} style={{ width: i===idx ? 20 : 7, height:7, borderRadius:20, background: i===idx ? "var(--brand,#af8564)" : "rgba(255,255,255,0.35)", border:"none", cursor:"pointer", padding:0, transition:"all 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal image carousel ─────────────────────────────────────────────────────
function ModalCarousel({ images, onLightbox }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) return (
    <div style={{ width:"100%", aspectRatio:"1/1", background:"var(--surface-2)", borderRadius:"var(--r)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--border)" }}>
      <i className="fa-regular fa-image" style={{ fontSize:"2.5rem", color:"var(--border)" }} />
    </div>
  );

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Main image */}
      <div
        onClick={() => onLightbox(images, idx)}
        style={{ position:"relative", aspectRatio:"1/1", background:"var(--surface-2)", borderRadius:"var(--r)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", cursor:"zoom-in", border:"1px solid var(--border)" }}
      >
        <img key={idx} src={images[idx]} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", padding:6 }} />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.35)", border:"none", color:"#fff", borderRadius:"50%", width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem" }}>
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.35)", border:"none", color:"#fff", borderRadius:"50%", width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem" }}>
              <i className="fa-solid fa-chevron-right" />
            </button>
            <span style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:"0.6rem", fontFamily:"var(--font)", fontWeight:600, padding:"2px 8px", borderRadius:20 }}>
              {idx + 1} / {images.length}
            </span>
            <div style={{ position:"absolute", bottom:8, left:0, right:0, display:"flex", justifyContent:"center", gap:4 }}>
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }} style={{ width: i===idx ? 16 : 5, height:5, borderRadius:3, padding:0, border:"none", cursor:"pointer", transition:"all 0.2s", background: i===idx ? "var(--brand,#a67853)" : "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ flexShrink:0, width:50, height:50, borderRadius:6, overflow:"hidden", border:`2px solid ${i===idx ? "var(--brand)" : "var(--border)"}`, background:"var(--surface-2)", cursor:"pointer", padding:0, transition:"border-color 0.18s" }}>
              <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", padding:3 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Compact spec image strip ─────────────────────────────────────────────────
function CompactSpecImages({ images, onLightbox }) {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div onClick={() => onLightbox(images, idx)} style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-in", minHeight:80 }}>
        <img key={idx} src={images[idx]} alt="" style={{ width:"100%", objectFit:"contain", display:"block", maxHeight:150 }} />
        {images.length > 1 && (
          <>
            <span style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.45)", color:"#fff", fontSize:"0.6rem", fontFamily:"var(--font)", fontWeight:600, padding:"2px 7px", borderRadius:20, pointerEvents:"none" }}>
              {idx + 1} / {images.length}
            </span>
            {[
              { fn: () => setIdx(i => (i - 1 + images.length) % images.length), side:"left",  icon:"fa-chevron-left"  },
              { fn: () => setIdx(i => (i + 1) % images.length),                  side:"right", icon:"fa-chevron-right" },
            ].map(({ fn, side, icon }) => (
              <button key={side} onClick={e => { e.stopPropagation(); fn(); }} style={{ position:"absolute", [side]:2, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--brand)" }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize:"0.78rem" }} />
              </button>
            ))}
          </>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display:"flex", gap:5, overflowX:"auto" }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ flexShrink:0, width:36, height:36, borderRadius:5, overflow:"hidden", border:`2px solid ${i===idx ? "var(--brand)" : "var(--border)"}`, background:"var(--surface-2)", cursor:"pointer", padding:0, transition:"border-color 0.18s" }}>
              <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", padding:2 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section mini-label ───────────────────────────────────────────────────────
function SLabel({ text, icon }) {
  return (
    <div style={{ fontSize:"0.62rem", fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
      {icon && <i className={`fa-solid ${icon}`} style={{ fontSize:"0.58rem" }} />}
      {text}
    </div>
  );
}

// ─── File download row ────────────────────────────────────────────────────────
function FileRow({ file, large }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display:"flex", alignItems:"center", gap: large ? 14 : 10, padding: large ? "13px 15px" : "9px 11px", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--r)", textDecoration:"none", transition:"border-color 0.15s, background 0.15s", marginBottom: large ? 0 : 6 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="var(--brand)"; e.currentTarget.style.background="var(--brand-muted)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--surface-2)"; }}
    >
      <div style={{ width: large ? 40 : 30, height: large ? 40 : 30, borderRadius: large ? 9 : 6, background:"linear-gradient(135deg,#8b5e3c,#a67853)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontSize: large ? "0.95rem" : "0.75rem" }}>
        <i className="fa-solid fa-file-pdf" />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize: large ? "0.83rem" : "0.76rem", color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</div>
        {large && <div style={{ fontSize:"0.67rem", color:"var(--text-3)", marginTop:2 }}>PDF · Click to open</div>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, padding: large ? "5px 12px" : "3px 9px", borderRadius:"var(--r-sm)", background:"var(--brand)", color:"#fff", fontSize:"0.68rem", fontWeight:700, flexShrink:0 }}>
        <i className="fa-solid fa-download" style={{ fontSize:"0.58rem" }} />
        {large ? "Download" : ""}
      </div>
    </a>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose, onFilterByModel, onFilterByTag, onFilterByCat }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox,  setLightbox]  = useState(null);

  useEffect(() => { setActiveTab("overview"); }, [product?.id]);

  useEffect(() => {
    const h = e => { if (e.key === "Escape" && !lightbox) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, lightbox]);

  if (!product) return null;

  const thumbnail  = localOrRemote(product, "thumbnail");
  const galleryRaw = localOrRemote(product, "images") || product.images || [];
  const allImages  = [
    ...(thumbnail ? [thumbnail] : []),
    ...galleryRaw.filter(u => u !== thumbnail),
  ].filter(Boolean);

  const specImages = localOrRemote(product, "spec_images") || product.spec_images || [];
  const files      = product.files      || [];
  const features   = product.features   || [];
  const categories = product.categories || [];
  const tags       = product.tags       || [];

  const tabs = [
    { id:"overview", label:"Overview",      icon:"fa-circle-info" },
    ...(product.description ? [{ id:"specs",    label:"Specs / Table", icon:"fa-table"    }] : []),
    ...(specImages.length   ? [{ id:"diagrams", label:"Diagrams",      icon:"fa-image"    }] : []),
    ...(files.length        ? [{ id:"files",    label:"Product Files", icon:"fa-file-pdf" }] : []),
  ];

  const goFilter = (type, value) => {
    onClose();
    if (type === "model") onFilterByModel(value);
    if (type === "tag")   onFilterByTag(value);
    if (type === "cat")   onFilterByCat(value);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(0,0,0,0.52)", backdropFilter:"blur(3px)" }}
      />

      {/* Fixed-size modal */}
      <div
        style={{
          position:"fixed",
          top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          zIndex:3001,
          width:"min(880px, calc(100vw - 32px))",
          height:"min(660px, calc(100vh - 40px))",
          background:"var(--surface)",
          borderRadius:"var(--r-lg)",
          border:"1px solid var(--border)",
          boxShadow:"0 24px 64px rgba(0,0,0,0.28)",
          display:"flex",
          flexDirection:"column",
          overflow:"hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px 12px 20px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          {thumbnail && (
            <img src={thumbnail} alt={product.name} style={{ width:36, height:36, objectFit:"contain", borderRadius:5, flexShrink:0, background:"var(--surface-2)", border:"1px solid var(--border)" }} />
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--text)", lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {product.name}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:3, flexWrap:"wrap" }}>
              {product.brand && <span style={{ fontSize:"0.7rem", color:"var(--text-3)", fontWeight:500 }}>{product.brand}</span>}
              {product.type && (
                <>
                  {product.brand && <span style={{ color:"var(--border)" }}>·</span>}
                  <button
                    onClick={() => goFilter("model", product.type)}
                    style={{ fontSize:"0.7rem", color:"var(--brand)", fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"var(--font)", textDecoration:"underline dotted" }}
                    title={`Show all "${product.type}" products`}
                  >
                    {product.type}
                  </button>
                </>
              )}
              <StatusBadge status={product.status} visible={product.visible !== false} />
              {product.featured && (
                <span style={{ fontSize:"0.67rem", color:"#b8860b", fontWeight:700 }}>
                  <i className="fa-solid fa-star" style={{ marginRight:3 }} />Featured
                </span>
              )}
            </div>
          </div>
          {/* Close — never clipped */}
          <button
            onClick={onClose}
            style={{ flexShrink:0, width:32, height:32, borderRadius:"50%", background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)", fontSize:"0.82rem", transition:"background 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--danger-bg)"; e.currentTarget.style.color="var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--surface-2)"; e.currentTarget.style.color="var(--text-2)"; }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:"flex", borderBottom:"1.5px solid var(--border)", flexShrink:0, overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:"9px 16px", border:"none", background:"none", fontFamily:"var(--font)", fontSize:"0.76rem", fontWeight:600, color: activeTab===t.id ? "var(--brand)" : "var(--text-3)", borderBottom:`2px solid ${activeTab===t.id ? "var(--brand)" : "transparent"}`, marginBottom:-1.5, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5, transition:"color 0.15s" }}>
              <i className={`fa-solid ${t.icon}`} style={{ fontSize:"0.66rem" }} />{t.label}
            </button>
          ))}
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, minHeight:"100%" }}>
              {/* Left: Carousel */}
              <div>
                <ModalCarousel images={allImages} onLightbox={(imgs, i) => setLightbox({ images:imgs, index:i })} />
              </div>

              {/* Right: details */}
              <div style={{ display:"flex", flexDirection:"column", gap:12, overflowY:"auto" }}>
                {product.short_description && (
                  <p style={{ fontSize:"0.82rem", color:"var(--text-2)", lineHeight:1.7, margin:0 }}>
                    {product.short_description}
                  </p>
                )}

                {features.length > 0 && (
                  <div>
                    <SLabel text="Features" icon="fa-list-check" />
                    <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:5 }}>
                      {features.map((f, i) => (
                        <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, fontSize:"0.79rem", color:"var(--text-2)" }}>
                          <i className="fa-solid fa-check" style={{ color:"var(--brand)", fontSize:"0.65rem", marginTop:3, flexShrink:0 }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {specImages.length > 0 && (
                  <div>
                    <SLabel text="Diagram" icon="fa-image" />
                    <CompactSpecImages images={specImages} onLightbox={(imgs, i) => setLightbox({ images:imgs, index:i })} />
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <SLabel text="Categories" icon="fa-folder" />
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {categories.map(c => (
                        <button key={c} onClick={() => goFilter("cat", c)} className="tbl-pill tbl-pill-cat" style={{ cursor:"pointer", border:"none", background:"rgba(175,133,100,0.13)", color:"var(--brand-dark)", fontFamily:"var(--font)", fontSize:"0.7rem" }} title={`Filter by: ${c}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <SLabel text="Tags" icon="fa-tag" />
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {tags.map(t => (
                        <button key={t} onClick={() => goFilter("tag", t)} className="tbl-pill tbl-pill-tag" style={{ cursor:"pointer", background:"var(--surface-2)", color:"var(--text-2)", border:"1px solid var(--border)", fontFamily:"var(--font)", fontSize:"0.7rem" }} title={`Filter by: ${t}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(product.brand || product.type) && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {product.brand && (
                      <div style={{ padding:"9px 11px", background:"var(--surface-2)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>
                        <div style={{ fontSize:"0.6rem", color:"var(--text-3)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Brand</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--text)", fontWeight:600 }}>{product.brand}</div>
                      </div>
                    )}
                    {product.type && (
                      <div style={{ padding:"9px 11px", background:"var(--surface-2)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>
                        <div style={{ fontSize:"0.6rem", color:"var(--text-3)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Model</div>
                        <button onClick={() => goFilter("model", product.type)} style={{ fontSize:"0.8rem", color:"var(--brand)", fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"var(--font)", textDecoration:"underline dotted", textAlign:"left" }} title={`Show all "${product.type}"`}>
                          {product.type}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {files.length > 0 && !tabs.find(t => t.id === "files") && (
                  <div>
                    <SLabel text="Product Files" icon="fa-file-pdf" />
                    {files.map((f, i) => <FileRow key={i} file={f} />)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPECS / TABLE */}
          {activeTab === "specs" && product.description && (
            <>
              <style>{`
                .vd-spec-wrap { overflow-x: auto; border-radius: var(--r); border: 1px solid var(--border); }
                .vd-spec-wrap table { width: 100%; border-collapse: collapse; font-family: var(--font); font-size: 0.78rem; background: var(--surface); }
                .vd-spec-wrap table th { background: var(--surface-2); color: var(--text-2); font-weight: 600; padding: 8px 10px; text-align: center; border-bottom: 1px solid var(--border); font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.3; white-space: normal; word-break: break-word; }
                .vd-spec-wrap table td { padding: 8px 10px; color: var(--text-2); border-bottom: 1px solid var(--border-light); text-align: center; font-size: 0.77rem; }
                .vd-spec-wrap table td:first-child { white-space: nowrap; font-weight: 500; color: var(--text); }
                .vd-spec-wrap table tbody tr:nth-child(odd) { background: var(--surface-2); }
                .vd-spec-wrap table tbody tr:hover { background: var(--brand-muted); }
                .vd-spec-wrap table tbody tr:last-child td { border-bottom: none; }
                .vd-spec-wrap table thead { position: sticky; top: 0; z-index: 1; }
              `}</style>
              <div className="vd-spec-wrap" dangerouslySetInnerHTML={{ __html: product.description }} />
            </>
          )}

          {/* DIAGRAMS */}
          {activeTab === "diagrams" && specImages.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {specImages.map((img, i) => (
                <div key={i} onClick={() => setLightbox({ images:specImages, index:i })} style={{ borderRadius:"var(--r)", overflow:"hidden", cursor:"zoom-in", border:"1px solid var(--border)", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <img src={img} alt={`Diagram ${i + 1}`} style={{ maxWidth:"100%", display:"block" }} />
                </div>
              ))}
            </div>
          )}

          {/* PRODUCT FILES */}
          {activeTab === "files" && files.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <p style={{ fontSize:"0.76rem", color:"var(--text-3)", margin:"0 0 4px" }}>
                {files.length} file{files.length !== 1 ? "s" : ""} available
              </p>
              {files.map((f, i) => <FileRow key={i} file={f} large />)}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding:"11px 20px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <a href={productUrl(product.slug)} target="_blank" rel="noopener noreferrer" style={{ fontSize:"0.74rem", color:"var(--brand)", fontWeight:600, display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize:"0.64rem" }} />View on website
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Lightbox rendered on top of modal */}
      {lightbox && (
        <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function ViewerCard({ product, onCardClick }) {
  const thumb = localOrRemote(product, "thumbnail");

  return (
    <div
      onClick={() => onCardClick(product)}
      style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)", overflow:"hidden", display:"flex", flexDirection:"column", transition:"box-shadow 0.2s, border-color 0.2s, transform 0.15s", cursor:"pointer" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow)"; e.currentTarget.style.borderColor="var(--brand-light)"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio:"4/3", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
        {thumb
          ? <img src={thumb} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
          : <i className="fa-regular fa-image" style={{ fontSize:"2rem", color:"var(--border)" }} />
        }
        {product.featured && (
          <div style={{ position:"absolute", top:8, left:8, background:"#b8860b", color:"#fff", padding:"2px 8px", borderRadius:20, fontSize:"0.62rem", fontWeight:700 }}>
            <i className="fa-solid fa-star" style={{ marginRight:3 }} />Featured
          </div>
        )}
        {(product.files || []).length > 0 && (
          <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.52)", color:"#fff", padding:"2px 7px", borderRadius:20, fontSize:"0.62rem", fontWeight:600, display:"flex", alignItems:"center", gap:4, backdropFilter:"blur(4px)" }}>
            <i className="fa-solid fa-file-pdf" style={{ fontSize:"0.55rem" }} />
            {product.files.length}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding:"10px 12px 12px", display:"flex", flexDirection:"column", gap:4, flex:1 }}>
        {/* Name: clicking links to product page, NOT opening modal */}
        <a
          href={productUrl(product.slug)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--text)", lineHeight:1.3, textDecoration:"none", display:"block" }}
          onMouseEnter={e => e.currentTarget.style.color="var(--brand)"}
          onMouseLeave={e => e.currentTarget.style.color="var(--text)"}
        >
          {product.name}
        </a>

        {(product.brand || product.type) && (
          <div style={{ display:"flex", gap:5, alignItems:"center", fontSize:"0.7rem", color:"var(--text-3)", flexWrap:"wrap" }}>
            {product.brand && <span>{product.brand}</span>}
            {product.brand && product.type && <span>·</span>}
            {product.type && <span style={{ color:"var(--brand)", fontWeight:600 }}>{product.type}</span>}
          </div>
        )}

        {/* Categories */}
        {(product.categories || []).length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginTop:"auto", paddingTop:4 }}>
            {(product.categories || []).slice(0, 2).map(c => (
              <span key={c} className="tbl-pill tbl-pill-cat">{c}</span>
            ))}
            {(product.categories || []).length > 2 && (
              <span className="tbl-pill tbl-pill-more">+{product.categories.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ViewerDisplay() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [allCats,  setAllCats]  = useState([]);
  const [allTags,  setAllTags]  = useState([]);
  const [allModels,setAllModels] = useState([]);

  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("");
  const [filterTag,    setFilterTag]    = useState("");
  const [filterModel,  setFilterModel]  = useState("");
  const [filterStatus, setFilterStatus] = useState("published");
  const [sortDir,      setSortDir]      = useState("desc");

  const [selected, setSelected] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats, tags] = await Promise.all([
        getAllProductsLive(),
        getAllCategoriesLive(),
        getAllTagsLive(),
      ]);
      setProducts(prods || []);
      setAllCats(cats.map(c => c.name));
      setAllTags(tags.map(t => t.name));
      setAllModels([...new Set((prods || []).map(p => p.type).filter(Boolean))].sort());
    } catch (err) {
      console.error("ViewerDisplay fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    if (filterStatus === "published" && (p.status !== "published" || p.visible === false)) return false;
    if (filterStatus === "draft"     && p.status !== "draft")    return false;
    if (filterStatus === "hidden"    && p.visible !== false)     return false;
    if (filterCat   && !(p.categories || []).includes(filterCat))  return false;
    if (filterTag   && !(p.tags       || []).includes(filterTag))  return false;
    if (filterModel && p.type !== filterModel)                     return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        (p.categories || []).some(c => c.toLowerCase().includes(q)) ||
        (p.tags       || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => {
    const at = new Date(a.created_at).getTime();
    const bt = new Date(b.created_at).getTime();
    return sortDir === "asc" ? at - bt : bt - at;
  });

  const hasActiveFilters = !!(search || filterCat || filterTag || filterModel || filterStatus !== "published");

  const clearFilters = () => {
    setSearch(""); setFilterCat(""); setFilterTag(""); setFilterModel(""); setFilterStatus("published"); setSortDir("desc");
  };

  // ── Callbacks from modal filter-links ─────────────────────────────────────
  const onFilterByModel = m => { setFilterModel(m);  setSelected(null); };
  const onFilterByTag   = t => { setFilterTag(t);    setSelected(null); };
  const onFilterByCat   = c => { setFilterCat(c);    setSelected(null); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="products-page">

      {/* Header */}
      <div className="page-header" style={{ marginBottom:14 }}>
        <div>
          <h1 className="page-title">
            <i className="fa-solid fa-store" style={{ marginRight:"0.5rem", color:"var(--brand)" }} />
            Product Catalog
          </h1>
          <p className="products-subtitle">
            {loading ? "Loading…" : `${filtered.length} of ${products.length} products`}
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={fetchAll} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
          <i className="fa-solid fa-rotate" /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar" style={{ flexWrap:"wrap" }}>
        <div className="search-wrap" style={{ flex:"1 1 200px", maxWidth:320 }}>
          <i className="fa-solid fa-magnifying-glass" />
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, brand, tag…" />
        </div>

        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </select>

        <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {allModels.length > 0 && (
          <select className="filter-select" value={filterModel} onChange={e => setFilterModel(e.target.value)}>
            <option value="">All Models</option>
            {allModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}

        <select className="filter-select" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
          <option value="">All Tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="filter-select" value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize:"0.68rem" }} />Clear
          </button>
        )}
      </div>

      {/* Active-filter chips */}
      {hasActiveFilters && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
          {filterCat && (
            <span className="tbl-pill tbl-pill-cat" style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
              Category: {filterCat}
              <button onClick={() => setFilterCat("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"inherit", fontSize:"0.68rem", display:"flex", alignItems:"center" }}><i className="fa-solid fa-xmark" /></button>
            </span>
          )}
          {filterModel && (
            <span className="tbl-pill" style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(175,133,100,0.15)", color:"var(--brand-dark)", border:"1px solid rgba(175,133,100,0.25)" }}>
              Model: {filterModel}
              <button onClick={() => setFilterModel("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"inherit", fontSize:"0.68rem", display:"flex", alignItems:"center" }}><i className="fa-solid fa-xmark" /></button>
            </span>
          )}
          {filterTag && (
            <span className="tbl-pill tbl-pill-tag" style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
              Tag: {filterTag}
              <button onClick={() => setFilterTag("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:"inherit", fontSize:"0.68rem", display:"flex", alignItems:"center" }}><i className="fa-solid fa-xmark" /></button>
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="table-loading">
          <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight:"0.5rem" }} />Loading products…
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:16 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"56px 20px", color:"var(--text-3)", fontSize:"0.85rem" }}>
              <i className="fa-solid fa-box-open" style={{ fontSize:"2rem", marginBottom:12, display:"block", opacity:0.3 }} />
              {hasActiveFilters ? "No products match the current filters." : "No products available yet."}
              {hasActiveFilters && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginTop:12 }}>Clear Filters</button>
              )}
            </div>
          ) : filtered.map(p => (
            <ViewerCard key={p.id} product={p} onCardClick={setSelected} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <ProductDetailModal
          product={selected}
          onClose={() => setSelected(null)}
          onFilterByModel={onFilterByModel}
          onFilterByTag={onFilterByTag}
          onFilterByCat={onFilterByCat}
        />
      )}
    </div>
  );
}