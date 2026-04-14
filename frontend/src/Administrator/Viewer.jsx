// src/Administrator/Viewer.jsx
// Read-only Products grid view for viewer role users
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getVisibleProductsLive, searchProductsLive } from "../local-storage/supabaseReader";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function localOrRemote(product, field) {
  return product?.[`local_${field}`] || product?.[field] || null;
}

export default function Viewer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const FRONT_URL = process.env.REACT_APP_FRONT_URL || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let data = search ? await searchProductsLive(search) : await getVisibleProductsLive();
      // Filter to ensure only published and visible
      data = data.filter(p => p.status === "published" && p.visible !== false);
      // Sort by created_at descending
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div style={{ padding: "2rem", background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>
          <i className="fa-solid fa-box" style={{ marginRight: "0.75rem", color: "var(--brand)" }} />
          Products
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
          Browse our collection of products
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "0 14px",
          maxWidth: "400px",
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-3)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              padding: "10px 0",
              fontSize: "0.9rem",
              color: "var(--text)",
            }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 2rem", color: "var(--text-2)" }}>
          <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 2rem", color: "var(--text-3)", fontSize: "0.95rem" }}>
          {search ? "No products match your search." : "No products available."}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
        }}>
          {products.map(p => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              style={{
                textDecoration: "none",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: "100%",
                height: "200px",
                background: "var(--surface-2)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                {localOrRemote(p, 'thumbnail') ? (
                  <img
                    src={localOrRemote(p, 'thumbnail')}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <i className="fa-regular fa-image" style={{ fontSize: "2.5rem", color: "var(--text-3)" }} />
                )}
                {p.featured && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "var(--brand)",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <i className="fa-solid fa-star" style={{ fontSize: "0.65rem" }} />
                    Featured
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: "0 0 4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {p.name}
                </h3>
                {p.brand && (
                  <p style={{
                    fontSize: "0.8rem",
                    color: "var(--text-3)",
                    margin: "0 0 8px",
                  }}>
                    {p.brand}
                  </p>
                )}
                {p.type && (
                  <div style={{
                    fontSize: "0.75rem",
                    color: "var(--brand)",
                    fontWeight: 500,
                    marginTop: "auto",
                  }}>
                    {p.type}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
