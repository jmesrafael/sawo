// src/pages/ProductPage.jsx
// Uses Supabase directly - no Express server dependency.
// Removed localStorage cache (caused disappearing content bug).

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../Administrator/supabase"; // adjust path if needed

/* - Lightbox ---------------------------- */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const prev = useCallback(() => { setIdx(i => (i - 1 + images.length) % images.length); setScale(1); setOffset({ x: 0, y: 0 }); }, [images.length]);
  const next = useCallback(() => { setIdx(i => (i + 1) % images.length); setScale(1); setOffset({ x: 0, y: 0 }); }, [images.length]);

  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, prev, next]);

  const handleWheel = e => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.001, 1), 4));
  };

  const handleMouseDown = e => {
    if (scale <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const handleMouseMove = e => {
    if (!dragging || !dragStart.current) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setDragging(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "ppFadeIn 0.2s ease",
      }}
    >
      <button onClick={onClose} style={{
        position: "absolute", top: 18, right: 18,
        background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
        width: 40, height: 40, cursor: "pointer", color: "#fff", fontSize: "1rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s", zIndex: 10,
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
      >
        <i className="fa-solid fa-xmark" />
      </button>

      {images.length > 1 && (
        <div style={{
          position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.12)", color: "#fff",
          padding: "4px 14px", borderRadius: 20,
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.72rem", fontWeight: 600,
        }}>
          {idx + 1} / {images.length}
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
        padding: "4px 14px", borderRadius: 20,
        fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem",
        pointerEvents: "none",
      }}>
        Scroll to zoom / Drag to pan / Esc to close
      </div>

      {images.length > 1 && (
        <>
          {[{ fn: prev, side: "left", icon: "fa-chevron-left" }, { fn: next, side: "right", icon: "fa-chevron-right" }].map(({ fn, side, icon }) => (
            <button key={side} onClick={e => { e.stopPropagation(); fn(); }} style={{
              position: "absolute", [side]: 16, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
              width: 44, height: 44, cursor: "pointer", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", transition: "background 0.2s", zIndex: 10,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            >
              <i className={`fa-solid ${icon}`} />
            </button>
          ))}
        </>
      )}

      <div
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          maxWidth: "88vw", maxHeight: "88vh",
          cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
      >
        <img
          src={images[idx]}
          alt=""
          draggable={false}
          style={{
            maxWidth: "88vw", maxHeight: "88vh",
            objectFit: "contain", borderRadius: 10,
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transition: dragging ? "none" : "transform 0.15s ease",
            display: "block",
          }}
        />
      </div>

      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 6,
        }} onClick={e => e.stopPropagation()}>
          {images.map((url, i) => (
            <button key={i} onClick={() => { setIdx(i); setScale(1); setOffset({ x: 0, y: 0 }); }}
              style={{
                width: 44, height: 44, borderRadius: 6, overflow: "hidden",
                border: `2px solid ${i === idx ? "#a67853" : "rgba(255,255,255,0.25)"}`,
                background: "rgba(0,0,0,0.4)", cursor: "pointer", padding: 0,
                transition: "border-color 0.18s", flexShrink: 0,
              }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* - Image Carousel ------------------------- */
function Carousel({ images, thumbnail, onImageClick }) {
  const all = [
    ...(thumbnail ? [thumbnail] : []),
    ...(images || []).filter(u => u !== thumbnail),
  ].filter(Boolean);

  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState({});

  if (!all.length) {
    return (
      <div style={{
        width: "100%", aspectRatio: "1/1", background: "#faf7f4",
        borderRadius: 14, display: "flex", alignItems: "center",
        justifyContent: "center", border: "1px solid #edddd0",
      }}>
        <i className="fa-regular fa-image" style={{ fontSize: "3.5rem", color: "#d5b99a" }} />
      </div>
    );
  }

  const prev = () => setIdx(i => (i - 1 + all.length) % all.length);
  const next = () => setIdx(i => (i + 1) % all.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        background: "#faf7f4", border: "1px solid #edddd0",
        aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-in",
      }}
        onClick={() => onImageClick(all, idx)}
      >
        {!err[idx] ? (
          <img key={idx} src={all[idx]} alt=""
            onError={() => setErr(e => ({ ...e, [idx]: true }))}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 24, animation: "ppFadeIn 0.25s ease" }}
          />
        ) : (
          <i className="fa-regular fa-image" style={{ fontSize: "2.5rem", color: "#d5b99a" }} />
        )}

        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "rgba(44,26,14,0.45)", color: "#fff",
          padding: "3px 9px", borderRadius: 6,
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5, pointerEvents: "none",
        }}>
          <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: "0.65rem" }} />
          Click to zoom
        </div>

        {all.length > 1 && (
          <>
            {[{ fn: prev, side: "left", icon: "fa-chevron-left" }, { fn: next, side: "right", icon: "fa-chevron-right" }].map(({ fn, side, icon }) => (
              <button key={side} onClick={e => { e.stopPropagation(); fn(); }} style={{
                position: "absolute", [side]: 10, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.92)", border: "1px solid #edddd0",
                borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(139,94,60,0.12)", transition: "all 0.2s", color: "#8b5e3c",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#8b5e3c"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.92)"; e.currentTarget.style.color = "#8b5e3c"; }}
              >
                <i className={`fa-solid ${icon}`} style={{ fontSize: "0.7rem" }} />
              </button>
            ))}
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
              {all.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                  style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, padding: 0, border: "none", cursor: "pointer", transition: "all 0.22s", background: i === idx ? "#a67853" : "rgba(139,94,60,0.25)" }} />
              ))}
            </div>
            <span style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(44,26,14,0.55)", color: "#fff",
              fontSize: "0.65rem", fontFamily: "'Montserrat',sans-serif",
              fontWeight: 600, padding: "2px 8px", borderRadius: 20,
            }}>
              {idx + 1} / {all.length}
            </span>
          </>
        )}
      </div>

      {all.length > 1 && (
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {all.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{
                flexShrink: 0, width: 58, height: 58, borderRadius: 8, overflow: "hidden",
                border: `2px solid ${i === idx ? "#a67853" : "#edddd0"}`,
                background: "#faf7f4", cursor: "pointer", padding: 0, transition: "border-color 0.18s",
              }}>
              {!err[i]
                ? <img src={url} alt="" onError={() => setErr(e => ({ ...e, [i]: true }))} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                : <i className="fa-regular fa-image" style={{ color: "#d5b99a", fontSize: "1rem" }} />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* - Diagram Carousel ------------------------ */
function DiagramCarousel({ images, onImageClick }) {
  const [idx, setIdx] = useState(0);
  const single = images.length === 1;
  if (!images.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        position: "relative", borderRadius: 10, overflow: "hidden",
        background: "#faf7f4", border: "1px solid #edddd0",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 200, cursor: "zoom-in",
      }} onClick={() => onImageClick(images, idx)}>
        <img
          key={idx} src={images[idx]} alt=""
          onError={e => { e.currentTarget.style.display = "none"; }}
          style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", padding: 16, animation: "ppFadeIn 0.2s ease", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(44,26,14,0.45)", color: "#fff",
          padding: "3px 9px", borderRadius: 6,
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5, pointerEvents: "none",
        }}>
          <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: "0.65rem" }} /> Click to zoom
        </div>
        {!single && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(44,26,14,0.55)", color: "#fff",
            fontSize: "0.63rem", fontFamily: "'Montserrat',sans-serif",
            fontWeight: 600, padding: "2px 8px", borderRadius: 20, pointerEvents: "none",
          }}>
            {idx + 1} / {images.length}
          </span>
        )}
        {!single && (
          <>
            {[
              { fn: () => setIdx(i => (i - 1 + images.length) % images.length), side: "left", icon: "fa-chevron-left" },
              { fn: () => setIdx(i => (i + 1) % images.length), side: "right", icon: "fa-chevron-right" },
            ].map(({ fn, side, icon }) => (
              <button key={side} onClick={e => { e.stopPropagation(); fn(); }} style={{
                position: "absolute", [side]: 8, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.92)", border: "1px solid #edddd0",
                borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#8b5e3c", fontSize: "0.65rem",
                boxShadow: "0 2px 6px rgba(139,94,60,0.1)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#8b5e3c"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.92)"; e.currentTarget.style.color = "#8b5e3c"; }}
              >
                <i className={`fa-solid ${icon}`} />
              </button>
            ))}
          </>
        )}
      </div>
      {!single && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{
                flexShrink: 0, width: 52, height: 52, borderRadius: 7, overflow: "hidden",
                border: `2px solid ${i === idx ? "#a67853" : "#edddd0"}`,
                background: "#faf7f4", cursor: "pointer", padding: 0, transition: "border-color 0.18s",
              }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* - Resources dropdown ----------------------- */
function ResourcesDropdown({ files }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!files?.length) return null;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px",
        background: "linear-gradient(135deg,#8b5e3c,#a67853)", color: "#fff",
        border: "none", borderRadius: 8, fontFamily: "'Montserrat',sans-serif",
        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
        boxShadow: "0 4px 16px rgba(139,94,60,0.28)", letterSpacing: "0.04em", transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,94,60,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,94,60,0.28)"; }}
      >
        <i className="fa-solid fa-file-arrow-down" />
        Resources
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: "0.65rem" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          minWidth: 240, background: "#fff", borderRadius: 10,
          boxShadow: "0 16px 50px rgba(139,94,60,0.18)",
          border: "1px solid #edddd0", overflow: "hidden",
          animation: "ppFadeIn 0.15s ease", zIndex: 100,
        }}>
          <div style={{
            padding: "7px 12px 5px", fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#a67853",
            fontFamily: "'Montserrat',sans-serif", borderBottom: "1px solid #edddd0",
          }}>
            Available Downloads
          </div>
          {files.map((f, i) => (
            <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
                color: "#2c1a0e", textDecoration: "none",
                fontFamily: "'Montserrat',sans-serif", fontSize: "0.8rem",
                borderBottom: i < files.length - 1 ? "1px solid #f5ede3" : "none",
                transition: "background 0.14s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fdf8f4"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#8b5e3c,#a67853)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-file-pdf" style={{ color: "#fff", fontSize: "0.75rem" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#2c1a0e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: "0.63rem", color: "#a67853" }}>PDF / Click to open</div>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: "#a67853", fontSize: "0.65rem", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* - Related Products ------------------------ */
function RelatedProducts({ currentSlug, categories }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!categories?.length) return;
    let cancelled = false;
    (async () => {
      try {
        // Use Supabase directly - overlaps any category
        const { data } = await supabase
          .from("products")
          .select("id,name,slug,thumbnail,categories")
          .eq("status", "published")
          .eq("visible", true)
          .neq("slug", currentSlug)
          .contains("categories", categories.slice(0, 1)) // at least one matching category
          .limit(4);
        if (!cancelled && data) setRelated(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [currentSlug, categories]);

  if (!related.length) return null;

  return (
    <section style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 32px 72px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#8b5e3c", margin: 0 }}>Related Products</h2>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.85rem", color: "#a67853", fontStyle: "italic", marginTop: 6 }}>You might also be interested in these</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
        {related.map(p => (
          <Link key={p.id || p.slug} to={`/products/${p.slug}`}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 12px 14px", transition: "all 0.25s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              {p.thumbnail
                ? <img src={p.thumbnail} alt={p.name} onError={e => { e.currentTarget.style.display = "none"; }} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                : <i className="fa-regular fa-image" style={{ color: "#d5b99a", fontSize: "2rem" }} />
              }
            </div>
            <p style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#2c1a0e", margin: "0 0 5px", lineHeight: 1.3 }}>{p.name}</p>
            {p.categories?.[0] && (
              <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#8b5e3c", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.categories[0]}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* - Skeleton ---------------------------- */
function SkeletonPage() {
  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 32px 60px" }}>
      <style>{`@keyframes skS{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="pp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div style={{ aspectRatio: "1/1", borderRadius: 14, background: "linear-gradient(90deg,#f5ede3 25%,#fdf8f4 50%,#f5ede3 75%)", backgroundSize: "200% 100%", animation: "skS 1.4s infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[35, 55, 80, 70, 60, 90, 55].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 26 : 12, width: `${w}%`, borderRadius: 6, background: "linear-gradient(90deg,#f5ede3 25%,#fdf8f4 50%,#f5ede3 75%)", backgroundSize: "200% 100%", animation: "skS 1.4s infinite" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* - Main ------------------------------ */
export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [lightbox, setLightbox] = useState(null);
  const openLightbox = (images, index) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProduct(null);

    (async () => {
      try {
        // Fetch directly from Supabase - no Express needed
        const { data, error: err } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .eq("visible", true)
          .single();

        if (err || !data) {
          if (!cancelled) setError("Product not found.");
        } else {
          if (!cancelled) setProduct(data);
        }
      } catch (e) {
        if (!cancelled) setError("Connection error. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", paddingTop: 80 }}>
      <SkeletonPage />
    </div>
  );

  if (error || !product) return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "'Montserrat',sans-serif", textAlign: "center", padding: "100px 24px 60px" }}>
      <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#8b5e3c,#a67853)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 28px rgba(139,94,60,0.28)" }}>
        <i className="fa-solid fa-magnifying-glass" style={{ color: "#fff", fontSize: "1.6rem" }} />
      </div>
      <h2 style={{ color: "#2c1a0e", margin: "0 0 8px" }}>Product Not Found</h2>
      <p style={{ color: "#a67853", margin: "0 0 24px", fontStyle: "italic", fontSize: "0.88rem" }}>{error || "This product doesn't exist or isn't published yet."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", background: "linear-gradient(135deg,#8b5e3c,#a67853)", color: "#fff", textDecoration: "none", fontWeight: 700, borderRadius: 7, fontSize: "0.82rem" }}>å Browse Products</Link>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", border: "1.5px solid #a67853", color: "#a67853", textDecoration: "none", fontWeight: 700, borderRadius: 7, fontSize: "0.82rem" }}>Home</Link>
      </div>
    </div>
  );

  const files        = product.files || [];
  const hasShortDesc = !!product.short_description;
  const hasDesc      = !!product.description;
  const hasFeatures  = (product.features || []).length > 0;
  const hasSpec      = (product.spec_images || []).length > 0;
  const hasSpecTable = product.spec_table?.headers?.length > 0;
  const hasCats      = (product.categories || []).length > 0;
  const hasTags      = (product.tags || []).length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        @keyframes ppFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:900px){
          .pp-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @media(max-width:600px){
          .pp-outer { padding: 20px 16px 0 !important; }
        }
      `}</style>

      {lightbox && (
        <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={closeLightbox} />
      )}

      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Montserrat',sans-serif" }}>

        <div className="pp-outer" style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 32px 0", paddingTop: 160 }}>
          <div className="pp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" }}>

            {/* LEFT col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Carousel
                images={product.images}
                thumbnail={product.thumbnail}
                onImageClick={openLightbox}
              />

              {(hasCats || hasTags) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
                  {hasCats && product.categories.map((c, i) => (
                    <Link key={i} to={`/products?category=${encodeURIComponent(c)}`}
                      style={{ background: "linear-gradient(135deg,#8b5e3c,#a67853)", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: "0.67rem", fontWeight: 700, fontFamily: "'Montserrat',sans-serif", textDecoration: "none", letterSpacing: "0.04em" }}>
                      {c}
                    </Link>
                  ))}
                  {hasTags && product.tags.map((t, i) => (
                    <span key={i} style={{ background: "#faf7f4", color: "#8b5e3c", padding: "3px 11px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 600, fontFamily: "'Montserrat',sans-serif", border: "1px solid #e0cfc0" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {hasSpec && (
                <div>
                  <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5e3c", margin: "0 0 8px" }}>
                    <i className="fa-solid fa-diagram-project" style={{ marginRight: 6, opacity: 0.7 }} />Diagrams
                  </h3>
                  <DiagramCarousel images={product.spec_images} onImageClick={openLightbox} />
                </div>
              )}
            </div>

            {/* RIGHT col */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(product.brand || product.type) && (
                <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a67853", margin: "0 0 7px" }}>
                  {[product.brand, product.type].filter(Boolean).join(" / ")}
                </p>
              )}

              <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "clamp(1.35rem,2.5vw,1.9rem)", color: "#2c1a0e", margin: "0 0 18px", lineHeight: 1.2 }}>
                {product.name}
              </h1>

              {hasShortDesc && (
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #edddd0" }}>
                  <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.92rem", color: "#7a5c45", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
                    {product.short_description}
                  </p>
                </div>
              )}

              {hasDesc && (
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #edddd0" }}>
                  <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5e3c", margin: "0 0 8px" }}>Description</h3>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", color: "#5a4030", lineHeight: 1.8, fontSize: "0.86rem" }}
                    dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}

              {hasFeatures && (
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #edddd0" }}>
                  <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5e3c", margin: "0 0 8px" }}>Features</h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                    {product.features.map((f, i) => (
                      <li key={i} style={{ fontFamily: "'Montserrat',sans-serif", color: "#5a4030", fontSize: "0.84rem", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <i className="fa-solid fa-check" style={{ color: "#a67853", fontSize: "0.68rem", marginTop: 4, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasSpecTable && (
                <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #edddd0" }}>
                  <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b5e3c", margin: "0 0 10px" }}>Technical Data</h3>
                  <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #edddd0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Montserrat',sans-serif", fontSize: "0.78rem" }}>
                      <thead>
                        <tr style={{ background: "#faf7f4" }}>
                          {product.spec_table.headers.map((h, i) => (
                            <th key={i} style={{ padding: "7px 12px", textAlign: "left", color: "#8b5e3c", fontWeight: 700, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #edddd0", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(product.spec_table.rows || []).map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: ri < product.spec_table.rows.length - 1 ? "1px solid #f5ede3" : "none" }}>
                            {product.spec_table.headers.map((h, ci) => (
                              <td key={ci} style={{ padding: "7px 12px", color: "#5a4030", fontSize: "0.78rem" }}>{row[h] || "-"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <ResourcesDropdown files={files} />
                </div>
              )}

              {!hasShortDesc && !hasDesc && !hasFeatures && !hasSpec && !hasSpecTable && files.length === 0 && (
                <p style={{ fontFamily: "'Montserrat',sans-serif", color: "#a67853", fontStyle: "italic", fontSize: "0.86rem" }}>
                  More details coming soon.
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1140, margin: "44px auto 0", padding: "0 32px" }}>
          <div style={{ height: 1, background: "linear-gradient(to right,transparent,#edddd0,transparent)" }} />
        </div>

        <RelatedProducts currentSlug={slug} categories={product.categories} />
      </div>
    </>
  );
}






