// src/pages/Sauna/heaters/WallMounted.jsx
// Shows ALL published products — cards are clickable → /products/:slug
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ButtonClear from "../../../components/Buttons/ButtonClear";
import CirclesInfo from "../../../components/CirclesInfo";
import heroImg from "../../../assets/Sauna/Sauna Heaters/wall-hero.webp";
import "./heaters.css";

const API       = process.env.REACT_APP_API_URL || "http://localhost:4000";
const CACHE_KEY = "sawo_wm_products";
const CACHE_TS  = "sawo_wm_products_ts";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached() {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    const ts   = parseInt(localStorage.getItem(CACHE_TS) || "0");
    if (data && Date.now() - ts < CACHE_TTL) return JSON.parse(data);
  } catch {}
  return null;
}
function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TS, Date.now().toString());
  } catch {}
}

function SkeletonCard() {
  return (
    <div className="wm-product-item" style={{ opacity: 0.45 }}>
      <div
        className="wm-product-img-wrap"
        style={{
          background: "linear-gradient(90deg,#f0ebe3 25%,#faf8f5 50%,#f0ebe3 75%)",
          backgroundSize: "200% 100%",
          animation: "wm-shimmer 1.5s infinite",
          borderRadius: 8,
        }}
      />
      <div style={{ height: 10, background: "#f0ebe3", borderRadius: 4, marginTop: 8, width: "70%", animation: "wm-shimmer 1.5s infinite" }} />
    </div>
  );
}

function ProductCard({ product }) {
  // Look for a kW power range tag
  const power = (product.tags || []).find(t => /\d+(\.\d+)?\s*[-–]\s*\d+(\.\d+)?\s*kW/i.test(t)) || "";

  return (
    <Link
      to={`/products/${product.slug}`}
      className="wm-product-item"
      style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "pointer" }}
    >
      <div
        className="wm-product-img-wrap"
        style={{ transition: "transform 0.3s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="wm-product-img"
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="wm-product-img-placeholder"><i className="fas fa-image" /></div>
        )}
      </div>
      <p className="wm-product-name" style={{ color: "#2c1f13" }}>{product.name}</p>
      {power && <p className="wm-product-power">{power}</p>}
    </Link>
  );
}

export default function WallMounted() {
  const cached = getCached();
  const [products, setProducts] = useState(cached || []);
  const [loading,  setLoading]  = useState(!cached);
  const [syncing,  setSyncing]  = useState(false);
  const [offline,  setOffline]  = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline  = () => { setOffline(false); fetchProducts(true); };
    const onOffline = () => setOffline(true);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProducts(force = false) {
    const c = getCached();
    if (c && !force) {
      setProducts(c);
      setLoading(false);
      setSyncing(true); // still refresh in background
    } else if (!c) {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API}/api/public/products`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setCache(data);
      }
    } catch {
      // Try snapshot fallback
      try {
        const snap = await fetch(`${API}/api/snapshot`, { signal: AbortSignal.timeout(5000) });
        if (snap.ok) {
          const s = await snap.json();
          if (Array.isArray(s?.data) && s.data.length) {
            setProducts(s.data);
            setCache(s.data);
          } else if (Array.isArray(s) && s.length) {
            setProducts(s);
            setCache(s);
          }
        }
      } catch {
        // Keep whatever we already have in state
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  return (
    <div className="relative">
      <style>{`
        @keyframes wm-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* HERO */}
      <section
        className="wm-hero min-h-[95vh] flex flex-col justify-center items-center text-center px-6 relative"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="wm-hero-overlay" />
        <div className="wm-hero-content">
          <h1 className="wm-hero-title">WALL-MOUNTED SAUNA HEATERS</h1>
          <p className="wm-hero-subtitle">Space-saving sleek modern designs</p>
          <div style={{ marginTop: "32px" }}>
            <ButtonClear text="EXPLORE HEATERS" href="https://www.sawo.com/sawo-products/finnish-sauna/sauna-heaters/sauna-products/" />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="wm-section">
        <div className="wm-container text-center">
          <h2 className="wm-products-title">Introducing Our Premium Wall Mounted Heaters</h2>
          <p className="wm-products-desc">
            Our wall-mounted heaters are crafted for those who love the traditional dry and hot sauna experience.
            This series of classic heaters boasts of robust, space-saving models for small and medium-sized saunas.
          </p>
        </div>
      </section>

      {/* Status banners */}
      {offline && (
        <div style={{ background: "#FEF5EC", borderTop: "1px solid #F5D5A0", borderBottom: "1px solid #F5D5A0", padding: "8px 24px", textAlign: "center", fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", color: "#9C6A10" }}>
          <i className="fa-solid fa-wifi" style={{ marginRight: 6, opacity: 0.6 }} />
          You are offline — showing last saved data
        </div>
      )}
      {syncing && !offline && (
        <div style={{ background: "#EBF5FB", borderTop: "1px solid #C5DDF0", borderBottom: "1px solid #C5DDF0", padding: "6px 24px", textAlign: "center", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", color: "#1A6A9A" }}>
          <i className="fa-solid fa-rotate" style={{ marginRight: 6 }} />
          Refreshing products…
        </div>
      )}

      {/* PRODUCTS GRID */}
      <section className="wm-section wm-section--flush-top">
        <div className="wm-container">
          {loading && (
            <div className="wm-products-grid">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
          {!loading && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Montserrat', sans-serif", color: "#888" }}>
              <p>No products available yet.{offline ? " Connect to the internet to load products." : ""}</p>
            </div>
          )}
          {!loading && products.length > 0 && (
            <div className="wm-products-grid">
              {products.map(p => <ProductCard key={p.id || p.slug} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* WHY SAWO */}
      <section className="wm-section">
        <div className="wm-container">
          <div className="wm-why-grid">
            <div className="wm-why-left">
              <p className="wm-eyebrow">SAWO HEATERS</p>
              <h2 className="wm-why-title">Why Choose SAWO Heaters</h2>
              <p className="wm-why-desc">
                SAWO heaters combine durability, energy efficiency, and modern design,
                offering consistent performance for a reliable, superior sauna experience every time.
              </p>
              <div style={{ marginTop: "20px" }}>
                <a
                  href="https://www.sawo.com/wp-content/uploads/2025/12/SAWO-Product-Catalogue-2025-2026-web.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wm-brochure-btn"
                >
                  VIEW BROCHURE
                </a>
              </div>
            </div>
            <div className="wm-why-right"><CirclesInfo /></div>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="wm-banner">
        <div className="wm-banner-content">
          <h2 className="wm-banner-title">Experience Ultimate Relaxation</h2>
          <p className="wm-banner-sub">Find your source of serenity from over 100 heater models</p>
        </div>
      </section>
    </div>
  );
}
