// src/Administrator/Taxonomy.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// - Shared Modal (matches Products modal style) -----------
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

// - Products-for-term drawer --------------------
function TermProductsModal({ open, onClose, term, field }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!open || !term) return;
    setLoading(true);
    supabase
      .from("products")
      .select("id,name,thumbnail,status,categories,tags")
      .contains(field, [term])
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, [open, term, field]);

  return (
    <Modal open={open} onClose={onClose} title={`Products using "${term}"`} wide>
      {loading ? (
        <div className="table-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products use this {field === "categories" ? "category" : "tag"} yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
              {p.thumbnail
                ? <img src={p.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="fa-regular fa-image" style={{ color: "var(--text-3)" }} /></div>
              }
              <span style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 14, color: "rgb(20,22,23)" }}>{p.name}</span>
              <span className="tbl-status" style={{ marginLeft: "auto" }}>{p.status}</span>
            </div>
          ))}
        </div>
      )}
      <div className="modal-footer" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

// - Form Modal (matches Products modal styling) -----------
function TaxFormModal({ open, onClose, editItem, table, hasDescription, onSaved }) {
  const [form, setForm]         = useState({ name: "", slug: "", description: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({ name: editItem.name, slug: editItem.slug, description: editItem.description || "" });
    } else {
      setForm({ name: "", slug: "", description: "" });
    }
    setError("");
  }, [open, editItem]);

  const handleNameChange = val => {
    setForm(f => ({ ...f, name: val, slug: editItem ? f.slug : slugify(val) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        ...(hasDescription && { description: form.description.trim() || null }),
      };
      if (editItem) {
        const { error: err } = await supabase.from(table).update(payload).eq("id", editItem.id);
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await supabase.from(table).insert([payload]);
        if (err) throw new Error(err.message);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const entityLabel = table === "categories" ? "Category" : "Tag";

  return (
    <Modal open={open} onClose={onClose} title={editItem ? `Edit ${entityLabel}` : `Add ${entityLabel}`}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Name <span style={{ color: "var(--danger)" }}>*</span></label>
          <input className="form-input" type="text" required value={form.name} onChange={e => handleNameChange(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Slug <span style={{ color: "var(--danger)" }}>*</span></label>
          <input className="form-input" type="text" required value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
          <p className="form-helper">Auto-generated and editable</p>
        </div>
        {hasDescription && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} /> {editItem ? "Saving..." : "Creating..."}</>
              : <><i className={editItem ? "fa-solid fa-floppy-disk" : "fa-solid fa-plus"} /> {editItem ? "Save Changes" : `Create ${entityLabel}`}</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
}

// - Term Card ----------------------------
function TermCard({ item, onEdit, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="term-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item.name)}
      title={`View products using "${item.name}"`}
    >
      {/* Edit pencil - top-right on hover */}
      {hovered && (
        <button
          type="button"
          className="term-card-edit-btn"
          onClick={e => { e.stopPropagation(); onEdit(item); }}
          title="Edit"
        >
          <i className="fa-solid fa-pen" />
        </button>
      )}
      <div className="term-card-icon">
        <i className="fa-solid fa-folder" style={{ color: "var(--brand)", fontSize: "1rem" }} />
      </div>
      <div className="term-card-name">{item.name}</div>
      {item.description && (
        <div className="term-card-desc">{item.description}</div>
      )}
      <div className="term-card-slug">{item.slug}</div>
    </div>
  );
}

function TagCard({ item, onEdit, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="term-card term-card-tag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item.name)}
      title={`View products using "${item.name}"`}
    >
      {hovered && (
        <button
          type="button"
          className="term-card-edit-btn"
          onClick={e => { e.stopPropagation(); onEdit(item); }}
          title="Edit"
        >
          <i className="fa-solid fa-pen" />
        </button>
      )}
      <div className="term-card-icon term-card-icon-tag">
        <i className="fa-solid fa-tag" style={{ color: "var(--brand-dark)", fontSize: "0.9rem" }} />
      </div>
      <div className="term-card-name">{item.name}</div>
      <div className="term-card-slug">{item.slug}</div>
    </div>
  );
}

// - Tab section ---------------------------
function TaxTab({ table, label, icon, hasDescription }) {
  const [items, setItems]         = useState([]);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(new Set());
  const [formOpen, setFormOpen]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkConfirm, setBulkConfirm]     = useState(false);
  const [productsModal, setProductsModal] = useState(null); // term name

  const fetch = async () => {
    const { data } = await supabase.from(table).select("*").order("name");
    if (data) setItems(data);
    setSelected(new Set());
  };

  useEffect(() => { fetch(); }, [table]); // eslint-disable-line

  const openAdd  = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = item => { setEditItem(item); setFormOpen(true); };

  const handleDelete = async id => {
    await supabase.from(table).delete().eq("id", id);
    setDeleteConfirm(null);
    fetch();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    await supabase.from(table).delete().in("id", ids);
    setBulkConfirm(false);
    setSelected(new Set());
    fetch();
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
    else setSelected(new Set(filtered.map(i => i.id)));
  };

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.slug.toLowerCase().includes(search.toLowerCase())
  );

  const entityLabel = table === "categories" ? "Category" : "Tag";

  return (
    <div>
      {/* Toolbar */}
      <div className="products-toolbar" style={{ marginBottom: 16 }}>
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${label.toLowerCase()}...`} />
        </div>

        {selected.size > 0 && (
          <button type="button" className="btn btn-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)", gap: 5 }} onClick={() => setBulkConfirm(true)}>
            <i className="fa-solid fa-trash" /> Delete {selected.size}
          </button>
        )}

        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Add {entityLabel}
        </button>
      </div>

      {/* Table */}
      <div className="products-table-wrap" style={{ marginBottom: 0 }}>
        <table className="products-table">
          <thead>
            <tr>
              <th style={{ width: 36, paddingRight: 0 }}>
                <input type="checkbox" className="tbl-checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleSelectAll} />
              </th>
              <th>Name</th>
              <th>Slug</th>
              {hasDescription && <th>Description</th>}
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={hasDescription ? 6 : 5} className="table-empty">No {label.toLowerCase()} yet.</td></tr>
            )}
            {filtered.map(item => (
              <tr key={item.id} className={selected.has(item.id) ? "row-selected" : ""}>
                <td style={{ paddingRight: 0 }}>
                  <input type="checkbox" className="tbl-checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                </td>
                <td>
                  <button
                    type="button"
                    className="product-name-link"
                    onClick={() => setProductsModal(item.name)}
                    style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  >
                    {item.name}
                  </button>
                </td>
                <td className="tbl-date" style={{ fontFamily: "monospace" }}>{item.slug}</td>
                {hasDescription && (
                  <td style={{ color: "var(--text-2)", fontSize: "0.82rem", maxWidth: 220 }}>
                    {item.description || <span style={{ color: "var(--text-3)" }}>-</span>}
                  </td>
                )}
                <td className="tbl-date">{new Date(item.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td style={{ textAlign: "right" }}>
                  <div className="table-actions">
                    {deleteConfirm === item.id ? (
                      <>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(item)}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button type="button" className="icon-btn danger" title="Delete" onClick={() => setDeleteConfirm(item.id)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card grid view below table */}
      {filtered.length > 0 && (
        <div className="term-cards-grid" style={{ marginTop: 20 }}>
          {filtered.map(item =>
            table === "categories"
              ? <TermCard key={item.id} item={item} onEdit={openEdit} onClick={name => setProductsModal(name)} />
              : <TagCard  key={item.id} item={item} onEdit={openEdit} onClick={name => setProductsModal(name)} />
          )}
        </div>
      )}

      {/* Form modal */}
      <TaxFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editItem={editItem}
        table={table}
        hasDescription={hasDescription}
        onSaved={fetch}
      />

      {/* Products modal */}
      <TermProductsModal
        open={!!productsModal}
        onClose={() => setProductsModal(null)}
        term={productsModal}
        field={table === "categories" ? "categories" : "tags"}
      />

      {/* Bulk delete confirm */}
      {bulkConfirm && (
        <div className="modal-overlay" onClick={() => setBulkConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Selected?</h2>
              <button className="modal-close-btn" onClick={() => setBulkConfirm(false)}></button>
            </div>
            <div className="modal-body">
              <p className="confirm-msg">Delete {selected.size} selected {label.toLowerCase()}? This cannot be undone.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setBulkConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleBulkDelete}>Delete All</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// - Main -------------------------------
export default function Taxonomy() {
  const [tab, setTab] = useState("categories");

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">
          <i className="fa-solid fa-tags" style={{ marginRight: "0.5rem", color: "var(--brand)" }} />
          Taxonomy
        </h1>
      </div>

      {/* Tabs */}
      <div className="tax-tabs">
        <button
          type="button"
          className={`tax-tab-btn${tab === "categories" ? " active" : ""}`}
          onClick={() => setTab("categories")}
        >
          <i className="fa-solid fa-folder" /> Categories
        </button>
        <button
          type="button"
          className={`tax-tab-btn${tab === "tags" ? " active" : ""}`}
          onClick={() => setTab("tags")}
        >
          <i className="fa-solid fa-tag" /> Tags
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === "categories" && (
          <TaxTab table="categories" label="Categories" icon="fa-solid fa-folder" hasDescription />
        )}
        {tab === "tags" && (
          <TaxTab table="tags" label="Tags" icon="fa-solid fa-tag" hasDescription={false} />
        )}
      </div>
    </div>
  );
}






