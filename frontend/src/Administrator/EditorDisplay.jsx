// src/Administrator/EditorDisplay.jsx
// Editor display page — allows editors to view and edit products with audit logging
import React, { useEffect, useState } from "react";
import { supabase, logActivity } from "./supabase";
import { getAllProductsLive, getProductByIdLive } from "../local-storage/supabaseReader";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function localOrRemote(product, field) {
  return product?.[`local_${field}`] || product?.[field] || null;
}

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Status Badge ─────────────────────────────────────────────────────────
function StatusBadge({ status, visible, featured }) {
  const colors = {
    published: { label: "Published", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    draft:     { label: "Draft",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };
  const cfg = colors[status] || { label: status, color: "var(--text-2)", bg: "var(--surface-2)" };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap",
    }}>
      <span style={{
        padding: "2px 8px", borderRadius: 12, fontSize: "0.65rem", fontWeight: 700,
        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40`,
      }}>
        {cfg.label}
      </span>
      {!visible && (
        <span style={{
          padding: "2px 8px", borderRadius: 12, fontSize: "0.65rem", fontWeight: 700,
          color: "#9ca3af", background: "rgba(156,163,175,0.1)", border: "1px solid rgba(156,163,175,0.3)",
        }}>
          Hidden
        </span>
      )}
      {featured && (
        <i className="fa-solid fa-star" style={{ fontSize: "0.75rem", color: "#f59e0b" }} title="Featured" />
      )}
    </div>
  );
}

// ─── Edit Product Modal ────────────────────────────────────────────────────────
function EditProductModal({ open, onClose, product, onSaved, currentUser }) {
  const [form, setForm] = useState({
    name: "", slug: "", short_description: "", description: "",
    status: "published", visible: true, featured: false, sort_order: 0,
    type: "", brand: "SAWO",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      short_description: product.short_description || "",
      description: product.description || "",
      status: product.status || "published",
      visible: product.visible !== false,
      featured: product.featured || false,
      sort_order: product.sort_order || 0,
      type: product.type || "",
      brand: product.brand || "SAWO",
    });
    setError("");
  }, [open, product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Track changes for logging
      const changes = {};
      const originalForm = {
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        description: product.description,
        status: product.status,
        visible: product.visible,
        featured: product.featured,
        sort_order: product.sort_order,
        type: product.type,
        brand: product.brand,
      };

      // Detect what changed
      for (const key in form) {
        if (form[key] !== originalForm[key]) {
          changes[key] = {
            old: originalForm[key],
            new: form[key],
          };
        }
      }

      // Update product
      const { error: err } = await supabase
        .from("products")
        .update(form)
        .eq("id", product.id);

      if (err) throw new Error(err.message);

      // Log the activity with detailed changes
      await logActivity({
        action: "update",
        entity: "product",
        entity_id: product.id,
        entity_name: product.name,
        username: currentUser.username,
        user_id: currentUser.id,
        meta: {
          fields_changed: Object.keys(changes),
          changes: changes,
        },
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val) => {
    setForm(f => ({
      ...f,
      name: val,
      slug: form.slug === product.slug ? slugify(val) : f.slug,
    }));
  };

  return (
    <>
      {open && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Product: {product?.name}</h2>
              <button className="modal-close-btn" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Basic Info */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                    Basic Information
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Product Name <span style={{ color: "var(--danger)" }}>*</span></label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Slug <span style={{ color: "var(--danger)" }}>*</span></label>
                      <input
                        className="form-input"
                        type="text"
                        required
                        value={form.slug}
                        onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                      />
                      <p className="form-helper">Auto-generated from name</p>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                    Descriptions
                  </h3>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Short Description</label>
                    <input
                      className="form-input"
                      type="text"
                      value={form.short_description}
                      onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                      placeholder="Brief overview of the product"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="form-label">Full Description</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                    Product Details
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Type / Model</label>
                      <input
                        className="form-input"
                        type="text"
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        placeholder="e.g., Sauna Heater, Control Unit"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Brand</label>
                      <input
                        className="form-input"
                        type="text"
                        value={form.brand}
                        onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Visibility */}
                <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                    Status & Visibility
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Status</label>
                      <select
                        className="form-input"
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Sort Order</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.sort_order}
                        onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.visible}
                        onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.9rem" }}>Visible</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.9rem" }}>Featured</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation" /> {error}
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading
                      ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                      : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Product Row ────────────────────────────────────────────────────────────
function ProductRow({ product, onEdit }) {
  const FRONT_URL = process.env.REACT_APP_FRONT_URL || "";
  const productUrl = `${FRONT_URL || window.location.origin}/products/${product.slug}`;

  return (
    <tr>
      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {localOrRemote(product, 'thumbnail') ? (
            <img
              src={localOrRemote(product, 'thumbnail')}
              alt={product.name}
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="fa-regular fa-image" style={{ color: "var(--text-3)", fontSize: "1rem" }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {product.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 2 }}>
              {product.type && <span>{product.type}</span>}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <StatusBadge status={product.status} visible={product.visible} featured={product.featured} />
      </td>
      <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View on website"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 6, background: "var(--surface-2)",
              border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s",
              color: "var(--text-2)", textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.borderColor = "var(--brand)";
              e.currentTarget.style.color = "var(--brand)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.85rem" }} />
          </a>
          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(product)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 6, background: "var(--surface-2)",
              border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s",
              color: "var(--text-2)", fontSize: "0.85rem",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.borderColor = "var(--brand)";
              e.currentTarget.style.color = "var(--brand)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            <i className="fa-solid fa-pen" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function EditorDisplay({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [types, setTypes] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await getAllProductsLive();
      data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setProducts(data || []);

      // Extract unique types
      const uniqueTypes = [...new Set(data.map(p => p.type).filter(Boolean))].sort();
      setTypes(uniqueTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Filter products
  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaved = () => {
    fetchProducts();
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="page-title">
            <i className="fa-solid fa-box" style={{ marginRight: "0.5rem", color: "var(--brand)" }} />
            Products
          </h1>
          <p className="products-subtitle">
            {loading ? "Loading…" : `${filtered.length} of ${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={fetchProducts}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}
        >
          <i className="fa-solid fa-rotate" /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
          />
        </div>

        <div className="filter-group" style={{ display: "flex", gap: 8 }}>
          <select
            className="form-input"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ height: 40, padding: "0 12px", fontSize: "0.9rem" }}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            className="form-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ height: 40, padding: "0 12px", fontSize: "0.9rem" }}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: "12px 0", padding: "12px 16px",
          background: "var(--danger-bg, #fef2f2)",
          border: "1px solid var(--danger)",
          borderRadius: "var(--r)",
          fontSize: "0.82rem", color: "var(--danger)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="table-loading">
          <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} /> Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 20px", color: "var(--text-3)",
          fontStyle: "italic", fontSize: "0.82rem",
        }}>
          {search || typeFilter || statusFilter ? "No products match your filters." : "No products found."}
        </div>
      ) : (
        <div style={{ borderRadius: "var(--r)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)" }}>
                  Product
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", width: 120 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <ProductRow key={product.id} product={product} onEdit={handleEditClick} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <EditProductModal
        open={editModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSaved={handleSaved}
        currentUser={currentUser}
      />
    </div>
  );
}
