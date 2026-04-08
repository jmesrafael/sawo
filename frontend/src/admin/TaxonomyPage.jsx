// src/admin/TaxonomyPage.jsx — v5: unified UI, click cat = view products
import React, { useEffect, useState } from "react";
import {
  apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory,
  apiGetTags, apiCreateTag, apiDeleteTag,
  apiGetProducts, apiUpdateProduct
} from "../lib/api";
import {
  Toast, useToast, Field, Btn, Modal, Confirm, PageShell,
  Badge, Card, EmptyState, C, F, SectionLabel, StatusBadge,
} from "./ui";

// ── Reusable item row ─────────────────────────────────────────────────
function TaxItem({ name, count = 0, slug, description, onEdit, onDelete, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: hov ? C.primaryXlt : "transparent", transition: "background 0.13s", cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.84rem", color: C.text }}>{name}</div>
        {slug && <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.textLight, marginTop: 1 }}>{slug}</div>}
        {description && <div style={{ fontFamily: F, fontSize: "0.73rem", color: C.textLight, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{description}</div>}
      </div>
      {count > 0 && <Badge label={`${count}`} color="gray" />}
      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
        {onEdit && (
          <button type="button" onClick={onEdit} title="Edit"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, padding: "4px 6px", borderRadius: 4, transition: "all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primaryXlt; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "none"; }}>
            <i className="fa-solid fa-pen" style={{ fontSize: "0.78rem" }} />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} title="Delete"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, padding: "4px 6px", borderRadius: 4, transition: "all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = C.dangerLt; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "none"; }}>
            <i className="fa-solid fa-trash" style={{ fontSize: "0.78rem" }} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function TaxonomyPage() {
  const { toasts, add, remove } = useToast();

  // Categories
  const [cats, setCats]         = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat]   = useState(null);
  const [catForm, setCatForm]   = useState({ name: "", description: "" });
  const [delCat, setDelCat]     = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  // Viewing products in category
  const [viewCat, setViewCat]   = useState(null);
  const [catProds, setCatProds] = useState([]);
  const [catProdsLoading, setCatProdsLoading] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [prodEditForm, setProdEditForm] = useState({});

  // Tags
  const [tags, setTags]         = useState([]);
  const [tagLoading, setTagLoading] = useState(true);
  const [newTag, setNewTag]     = useState("");
  const [savingTag, setSavingTag] = useState(false);
  const [delTag, setDelTag]     = useState(null);
  const [tagModal, setTagModal] = useState(false);
  const [editTag, setEditTag]   = useState(null);

  // Active tab
  const [tab, setTab] = useState("categories"); // "categories" | "tags"

  const loadCats = async () => { setCatLoading(true); try { setCats(await apiGetCategories()); } catch {} finally { setCatLoading(false); } };
  const loadTags = async () => { setTagLoading(true); try { setTags(await apiGetTags()); }       catch {} finally { setTagLoading(false); } };

  useEffect(() => { loadCats(); loadTags(); }, []);

  // ── Category CRUD ─────────────────────────────────────────────────
  const openCreateCat = () => { setEditCat(null); setCatForm({ name: "", description: "" }); setCatModal(true); };
  const openEditCat   = (c) => { setEditCat(c); setCatForm({ name: c.name, description: c.description || "" }); setCatModal(true); };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return add("Name required.", "error");
    setSavingCat(true);
    try {
      editCat ? await apiUpdateCategory(editCat.id, catForm) : await apiCreateCategory(catForm);
      add(editCat ? "Updated." : "Category created.", "success");
      setCatModal(false); loadCats();
    } catch (err) { add(err.message, "error"); }
    finally { setSavingCat(false); }
  };

  const handleDelCat = async () => {
    try { await apiDeleteCategory(delCat.id); add("Deleted.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setDelCat(null); loadCats(); }
  };

  // ── View products in category ─────────────────────────────────────
  const openCatProducts = async (cat) => {
    setViewCat(cat); setCatProdsLoading(true);
    try { const prods = await apiGetProducts({ category: cat.name }); setCatProds(prods); }
    catch (err) { add(err.message, "error"); }
    finally { setCatProdsLoading(false); }
  };

  // Quick status toggle directly from taxonomy view
  const toggleProdStatus = async (prod) => {
    const newStatus = prod.status === "published" ? "draft" : "published";
    try {
      await apiUpdateProduct(prod.id, { ...prod, status: newStatus });
      setCatProds(ps => ps.map(p => p.id === prod.id ? { ...p, status: newStatus } : p));
    } catch (err) { add(err.message, "error"); }
  };

  // ── Tags CRUD ─────────────────────────────────────────────────────
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setSavingTag(true);
    try { await apiCreateTag({ name: newTag.trim() }); add("Tag created.", "success"); setNewTag(""); loadTags(); }
    catch (err) { add(err.message, "error"); }
    finally { setSavingTag(false); }
  };

  const handleDelTag = async () => {
    try { await apiDeleteTag(delTag.id); add("Deleted.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setDelTag(null); loadTags(); }
  };

  // ── Tab styles ────────────────────────────────────────────────────
  const tabBtn = (t) => ({
    padding: "8px 20px", border: "none", borderRadius: 6, fontFamily: F, fontWeight: 600, fontSize: "0.82rem",
    background: tab === t ? C.primary : "transparent", color: tab === t ? "#fff" : C.textMid,
    cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <PageShell title="Categories & Tags" subtitle="Manage taxonomy — click a category to see its products">
      <Toast toasts={toasts} remove={remove} />

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.bg, padding: 4, borderRadius: 8, width: "fit-content" }}>
        <button style={tabBtn("categories")} onClick={() => { setTab("categories"); setViewCat(null); }}>Categories ({cats.length})</button>
        <button style={tabBtn("tags")}       onClick={() => { setTab("tags"); setViewCat(null); }}>Tags ({tags.length})</button>
      </div>

      {/* ── CATEGORIES TAB ── */}
      {tab === "categories" && !viewCat && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 700 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn icon="fa-plus" label="New Category" size="sm" onClick={openCreateCat} />
          </div>
          <Card>
            {catLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: C.textLight, fontFamily: F, fontSize: "0.82rem" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading…
              </div>
            ) : cats.length === 0 ? (
              <EmptyState icon="fa-folder" title="No categories" message="Add categories to organize your products." action={<Btn icon="fa-plus" label="Add Category" size="sm" onClick={openCreateCat} />} />
            ) : (
              <>
                {/* Header */}
                <div style={{ display: "flex", gap: 10, padding: "8px 14px", borderBottom: `2px solid ${C.border}`, background: C.bg }}>
                  <span style={{ flex: 1, fontFamily: F, fontSize: "0.68rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</span>
                  <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Products</span>
                  <span style={{ width: 60 }} />
                </div>
                {cats.map(c => (
                  <TaxItem key={c.id} name={c.name} slug={c.slug} description={c.description} count={c.usage_count}
                    onClick={() => openCatProducts(c)}
                    onEdit={() => openEditCat(c)} onDelete={() => setDelCat(c)} />
                ))}
              </>
            )}
          </Card>
          <div style={{ fontFamily: F, fontSize: "0.75rem", color: C.textLight, padding: "8px 12px", background: C.primaryXlt, borderRadius: 7 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: C.primary }} />
            Click a category name to see which products belong to it. You can edit products directly from there.
          </div>
        </div>
      )}

      {/* ── CATEGORY PRODUCTS VIEW ── */}
      {tab === "categories" && viewCat && (
        <div style={{ maxWidth: 900 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <button type="button" onClick={() => setViewCat(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.primary, fontFamily: F, fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> All Categories
            </button>
            <span style={{ color: C.textLight, fontFamily: F }}>›</span>
            <h2 style={{ fontFamily: F, fontWeight: 700, color: C.text, margin: 0, fontSize: "1rem" }}>{viewCat.name}</h2>
            {viewCat.description && <span style={{ fontFamily: F, fontSize: "0.78rem", color: C.textLight }}>— {viewCat.description}</span>}
          </div>

          <Card>
            {catProdsLoading ? (
              <div style={{ padding: "24px", textAlign: "center", color: C.textLight, fontFamily: F }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading products…
              </div>
            ) : catProds.length === 0 ? (
              <EmptyState icon="fa-box-open" title="No products in this category" message="Assign products to this category from the Products page." />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: C.bg, borderBottom: `2px solid ${C.border}` }}>
                    <th style={{ ...TH, textAlign: "left" }}>Product</th>
                    <th style={TH}>Status</th>
                    <th style={TH}>Updated</th>
                    <th style={{ ...TH, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catProds.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.primaryXlt}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={TD}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {p.thumbnail
                            ? <img src={p.thumbnail} alt="" style={{ width: 38, height: 38, borderRadius: 5, objectFit: "cover", border: `1px solid ${C.border}`, flexShrink: 0 }} />
                            : <div style={{ width: 38, height: 38, borderRadius: 5, background: C.bg, flexShrink: 0 }} />
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: C.text }}>{p.name}</div>
                            <div style={{ color: C.textLight, fontSize: "0.7rem" }}>{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                          <StatusBadge status={p.status} visible={p.visible} />
                          <button type="button" onClick={() => toggleProdStatus(p)} title={p.status === "published" ? "Set to Draft" : "Publish"}
                            style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, fontSize: "0.7rem", fontFamily: F }}>
                            {p.status === "published" ? "↓ Draft" : "↑ Publish"}
                          </button>
                        </div>
                      </td>
                      <td style={{ ...TD, textAlign: "center", color: C.textLight, fontSize: "0.72rem" }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ ...TD, textAlign: "right" }}>
                        <Btn size="sm" icon="fa-pen" label="Edit"
                          onClick={() => window.dispatchEvent(new CustomEvent("sawo:editProduct", { detail: p }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
          <p style={{ fontFamily: F, fontSize: "0.75rem", color: C.textLight, marginTop: 10 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
            "Edit" opens the full product editor in the Products page. Go to Products → edit from there for full control.
          </p>
        </div>
      )}

      {/* ── TAGS TAB ── */}
      {tab === "tags" && (
        <div style={{ maxWidth: 700 }}>
          {/* Quick add */}
          <form onSubmit={handleAddTag} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="New tag name…"
              style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.875rem", background: C.surface, color: C.text, outline: "none" }} />
            <Btn type="submit" loading={savingTag} label="Add Tag" icon="fa-plus" />
          </form>

          <Card>
            {tagLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: C.textLight, fontFamily: F }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading…
              </div>
            ) : tags.length === 0 ? (
              <EmptyState icon="fa-tag" title="No tags yet" message="Tags created in the product form appear here automatically." />
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, padding: "8px 14px", borderBottom: `2px solid ${C.border}`, background: C.bg }}>
                  <span style={{ flex: 1, fontFamily: F, fontSize: "0.68rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tag</span>
                  <span style={{ fontFamily: F, fontSize: "0.68rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Used</span>
                  <span style={{ width: 40 }} />
                </div>
                {tags.map(t => (
                  <TaxItem key={t.id} name={t.name} slug={t.slug} count={t.usage_count} onDelete={() => setDelTag(t)} />
                ))}
              </>
            )}
          </Card>
          <div style={{ marginTop: 12, fontFamily: F, fontSize: "0.75rem", color: C.textLight, padding: "8px 12px", background: C.primaryXlt, borderRadius: 7 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6, color: C.primary }} />
            New tags typed in the product form are automatically saved here. Most-used tags appear first in autocomplete suggestions.
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={editCat ? "Edit Category" : "New Category"} width={420}>
        <form onSubmit={handleSaveCat} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wall-Mounted" required />
          <Field label="Description (optional)" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn label="Cancel" variant="ghost" onClick={() => setCatModal(false)} />
            <Btn loading={savingCat} label={editCat ? "Save" : "Create"} icon="fa-check" type="submit" />
          </div>
        </form>
      </Modal>

      <Confirm open={!!delCat} onClose={() => setDelCat(null)} onConfirm={handleDelCat} title="Delete Category?" message={`Delete "${delCat?.name}"? Products using it won't be affected.`} confirmLabel="Delete" />
      <Confirm open={!!delTag} onClose={() => setDelTag(null)} onConfirm={handleDelTag} title="Delete Tag?" message={`Delete tag "${delTag?.name}"?`} confirmLabel="Delete" />
    </PageShell>
  );
}

const TH = { padding: "9px 12px", textAlign: "center", color: C.textLight, fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" };
const TD = { padding: "10px 12px", verticalAlign: "middle" };
