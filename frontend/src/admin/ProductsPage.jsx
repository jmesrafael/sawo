// src/admin/ProductsPage.jsx — v5
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  apiGetProducts, apiGetProduct, apiCreateProduct, apiUpdateProduct,
  apiDeleteProduct, apiDuplicateProduct, apiBulkProducts,
  apiUploadImage, apiUploadImages,
  apiGetCategories, apiGetTags, apiCreateCategory, apiCreateTag,
} from "../lib/api";
import {
  Toast, useToast, Field, RichField, Select, Btn, IconBtn, Modal, Confirm,
  PageShell, Badge, StatusBadge, PillInput, ImageUploader, ImageStrip,
  Toggle, Checkbox, Card, SectionLabel, Skeleton, C, F,
} from "./ui";

const FRONT_URL = process.env.REACT_APP_FRONT_URL || "http://localhost:3000";
const EMPTY_FORM = {
  name: "", slug: "", short_description: "", description: "",
  thumbnail: "", images: [], spec_images: [],
  categories: [], tags: [], features: [],
  brand: "", type: "",
  status: "draft", visible: true, featured: false, sort_order: 0,
};

export default function ProductsPage({ currentUser }) {
  const { toasts, add, remove } = useToast();
  const [products, setProducts]   = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [allCats, setAllCats]     = useState([]);
  const [allTags, setAllTags]     = useState([]);

  // UI
  const [viewMode, setViewMode]   = useState("list");
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);

  // Upload
  const [upThumb, setUpThumb]   = useState(false);
  const [upImgs, setUpImgs]     = useState(false);
  const [upSpec, setUpSpec]     = useState(false);

  // Filters — all combined into one search
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy]       = useState("created_at:desc");

  // ── Load ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setDataLoading(true);
    const [sort, dir] = sortBy.split(":");
    try {
      const [prods, cats, tags] = await Promise.all([
        apiGetProducts({ sort, dir, ...(filterStatus ? { status: filterStatus } : {}) }),
        apiGetCategories(),
        apiGetTags(),
      ]);
      setProducts(prods);
      setAllCats(cats.map(c => c.name));
      setAllTags(tags.map(t => t.name));
    } catch (err) { add(err.message, "error"); }
    finally { setDataLoading(false); }
  }, [filterStatus, sortBy]);

  useEffect(() => { load(); }, [load]);

  // ── Slug ─────────────────────────────────────────────────────────
  const genSlug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: slugEdited ? f.slug : genSlug(name) }));
  };

  // ── Open/close ───────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setSlugEdited(false); setModalOpen(true); };
  const openEdit   = async (row) => {
    try {
      const p = await apiGetProduct(row.id);
      setForm({ name: p.name || "", slug: p.slug || "", short_description: p.short_description || "", description: p.description || "", thumbnail: p.thumbnail || "", images: p.images || [], spec_images: p.spec_images || [], categories: p.categories || [], tags: p.tags || [], features: p.features || [], brand: p.brand || "", type: p.type || "", status: p.status || "draft", visible: p.visible !== false, featured: p.featured || false, sort_order: p.sort_order || 0 });
      setSlugEdited(true); setEditing(row); setModalOpen(true);
    } catch (err) { add(err.message, "error"); }
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  // ── Auto-save new tags/categories ─────────────────────────────────
  const onNewCategory = async (name) => {
    try { await apiCreateCategory({ name }); setAllCats(c => [...new Set([...c, name])]); }
    catch {}
  };
  const onNewTag = async (name) => {
    try { await apiCreateTag({ name }); setAllTags(t => [...new Set([...t, name])]); }
    catch {}
  };

  // ── Upload — thumbnail (works from button click too) ─────────────
  const thumbInputRef = useRef();

  const handleThumbFiles = async (fileOrFiles) => {
    const file = fileOrFiles instanceof File ? fileOrFiles : fileOrFiles?.[0];
    if (!file) return;
    setUpThumb(true);
    try { const { url } = await apiUploadImage(file); setForm(f => ({ ...f, thumbnail: url })); add("Thumbnail uploaded.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setUpThumb(false); }
  };

  const uploadMoreImages = async (files) => {
    setUpImgs(true);
    try {
      const arr = Array.isArray(files) ? files : [files];
      const results = await apiUploadImages(arr);
      setForm(f => ({ ...f, images: [...f.images, ...results.map(r => r.url)] }));
      add(`${results.length} image(s) uploaded.`, "success");
    } catch (err) { add(err.message, "error"); }
    finally { setUpImgs(false); }
  };

  const uploadSpecImages = async (files) => {
    setUpSpec(true);
    try {
      const arr = Array.isArray(files) ? files : [files];
      const results = await apiUploadImages(arr);
      setForm(f => ({ ...f, spec_images: [...f.spec_images, ...results.map(r => r.url)] }));
    } catch (err) { add(err.message, "error"); }
    finally { setUpSpec(false); }
  };

  // ── Save ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return add("Product name is required.", "error");
    if (!form.slug) return add("Slug is required.", "error");
    setSaving(true);
    try {
      editing ? await apiUpdateProduct(editing.id, form) : await apiCreateProduct(form);
      add(editing ? "Product saved." : "Product created.", "success");
      closeModal(); load(); setSelected([]);
    } catch (err) { add(err.message, "error"); }
    finally { setSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try { await apiDeleteProduct(confirmDel.id); add("Deleted.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setConfirmDel(null); load(); setSelected([]); }
  };

  // ── Duplicate ─────────────────────────────────────────────────────
  const handleDuplicate = async (row) => {
    try { await apiDuplicateProduct(row.id); add(`"${row.name}" duplicated.`, "success"); load(); }
    catch (err) { add(err.message, "error"); }
  };

  // ── Bulk ─────────────────────────────────────────────────────────
  const handleBulk = async (action) => {
    if (!selected.length) return;
    try { const r = await apiBulkProducts(selected, action); add(`${r.affected} updated.`, "success"); setSelected([]); load(); }
    catch (err) { add(err.message, "error"); }
    finally { setConfirmBulk(null); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(p => p.id));

  // ── Search everything ─────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────
  const Toolbar = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {/* Search — full width-ish */}
      <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.textLight, fontSize: "0.78rem" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, brand, category, tag…"
          style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.82rem", background: C.surface, color: C.text, boxSizing: "border-box", outline: "none" }} />
      </div>
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selStyle}>
        <option value="created_at:desc">Newest</option>
        <option value="created_at:asc">Oldest</option>
        <option value="name:asc">Name A–Z</option>
        <option value="updated_at:desc">Recently Updated</option>
        <option value="sort_order:asc">Sort Order</option>
      </select>
      {/* View toggle */}
      <div style={{ display: "flex", border: `1.5px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
        {[{ v: "list", icon: "fa-list" }, { v: "grid", icon: "fa-grip" }].map(({ v, icon }) => (
          <button key={v} type="button" onClick={() => setViewMode(v)}
            style={{ padding: "6px 11px", border: "none", background: viewMode === v ? C.primary : C.surface, color: viewMode === v ? "#fff" : C.textLight, cursor: "pointer", fontSize: "0.82rem", transition: "all 0.15s" }}>
            <i className={`fa-solid ${icon}`} />
          </button>
        ))}
      </div>
      {/* New Product button — same row */}
      <Btn icon="fa-plus" label="New Product" onClick={openCreate} />
    </div>
  );

  return (
    <PageShell
      title="Products"
      subtitle={dataLoading ? "Loading…" : `${filtered.length} of ${products.length} products`}
      toolbar={Toolbar}
    >
      <Toast toasts={toasts} remove={remove} />

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div style={{ background: C.infoLt, border: `1px solid #c5ddf0`, borderRadius: 7, padding: "8px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: F, fontSize: "0.8rem", color: C.info, fontWeight: 600 }}>{selected.length} selected</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" label="Publish" icon="fa-globe"     onClick={() => handleBulk("publish")} />
            <Btn size="sm" label="Draft"   icon="fa-file-pen"  variant="light" onClick={() => handleBulk("draft")} />
            <Btn size="sm" label="Show"    icon="fa-eye"       variant="light" onClick={() => handleBulk("show")} />
            <Btn size="sm" label="Hide"    icon="fa-eye-slash" variant="light" onClick={() => handleBulk("hide")} />
            <Btn size="sm" label="Delete"  icon="fa-trash"     variant="danger" onClick={() => setConfirmBulk("delete")} />
          </div>
          <button type="button" onClick={() => setSelected([])} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.info, fontSize: "0.78rem", fontFamily: F }}>Clear</button>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflowX: "auto" }}>
          {dataLoading ? (
            <div style={{ padding: 16 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <Skeleton w={42} h={42} r={6} /><div style={{ flex: 1 }}><Skeleton h={12} style={{ marginBottom: 6 }} /><Skeleton w="50%" h={10} /></div><Skeleton w={70} h={20} r={20} />
                </div>
              ))}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: "0.82rem", minWidth: 900 }}>
              <thead>
                <tr style={{ background: C.bg, borderBottom: `2px solid ${C.border}` }}>
                  <th style={TH}><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                  <th style={TH}></th>
                  <th style={{ ...TH, textAlign: "left", minWidth: 200 }}>Product</th>
                  <th style={{ ...TH, minWidth: 140 }}>Categories</th>
                  <th style={{ ...TH, minWidth: 140 }}>Tags</th>
                  <th style={{ ...TH, minWidth: 90 }}>Status</th>
                  <th style={{ ...TH, minWidth: 80 }}>By</th>
                  <th style={{ ...TH, minWidth: 90 }}>Updated</th>
                  <th style={{ ...TH, textAlign: "right", minWidth: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !dataLoading && (
                  <tr><td colSpan={9} style={{ padding: "28px", textAlign: "center", color: C.textLight, fontStyle: "italic", fontFamily: F }}>
                    {search ? `No products match "${search}"` : "No products yet — click New Product to create one."}
                  </td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.primaryXlt}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={TD}><Checkbox checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                    <td style={{ ...TD, width: 52 }}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: 5, objectFit: "cover", border: `1px solid ${C.border}`, display: "block" }} />
                        : <div style={{ width: 44, height: 44, borderRadius: 5, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-regular fa-image" style={{ color: C.border }} /></div>
                      }
                    </td>
                    <td style={TD}>
                      {/* Click name → open product page in new tab */}
                      <a href={`${FRONT_URL}/products/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontWeight: 600, color: C.primary, fontFamily: F, fontSize: "0.82rem", textDecoration: "underline", cursor: "pointer" }}>
                        {p.name}
                      </a>
                      <div style={{ color: C.textLight, fontSize: "0.7rem", marginTop: 1 }}>{p.slug}</div>
                      {p.featured && <span style={{ fontSize: "0.65rem", color: C.warning }}><i className="fa-solid fa-star" style={{ marginRight: 3 }} />Featured</span>}
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                        {(p.categories || []).slice(0, 2).map(c => <Badge key={c} label={c} color="brown" />)}
                        {(p.categories || []).length > 2 && <Badge label={`+${p.categories.length - 2}`} color="gray" />}
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                        {(p.tags || []).slice(0, 2).map(t => <Badge key={t} label={t} color="blue" />)}
                        {(p.tags || []).length > 2 && <Badge label={`+${p.tags.length - 2}`} color="gray" />}
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign: "center" }}><StatusBadge status={p.status} visible={p.visible} /></td>
                    <td style={{ ...TD, textAlign: "center", color: C.textLight, fontSize: "0.72rem" }}>{p.created_by_username ? `@${p.created_by_username}` : "—"}</td>
                    <td style={{ ...TD, textAlign: "center", color: C.textLight, fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                      {p.updated_at ? new Date(p.updated_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ ...TD, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 2 }}>
                        <IconBtn icon="fa-pen"   title="Edit"      onClick={() => openEdit(p)} />
                        <IconBtn icon="fa-copy"  title="Duplicate" onClick={() => handleDuplicate(p)} />
                        <IconBtn icon="fa-trash" title="Delete"    onClick={() => setConfirmDel(p)} color={C.danger} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && (
        dataLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <Skeleton w="100%" h={130} r={0} /><div style={{ padding: "10px 10px 12px" }}><Skeleton h={12} style={{ marginBottom: 6 }} /><Skeleton w="60%" h={10} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {filtered.length === 0 && !dataLoading && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: C.textLight, fontFamily: F, fontStyle: "italic" }}>
                {search ? `No products match "${search}"` : "No products yet."}
              </div>
            )}
            {filtered.map(p => (
              <div key={p.id} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden", position: "relative" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(175,133,100,0.18)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ position: "absolute", top: 7, left: 7, zIndex: 2 }}>
                  <Checkbox checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                </div>
                <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2 }}>
                  <button type="button" onClick={() => openEdit(p)} style={{ background: "rgba(255,255,255,0.92)", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 7px", cursor: "pointer", color: C.primary, fontSize: "0.75rem" }}>
                    <i className="fa-solid fa-pen" />
                  </button>
                </div>
                {/* Clickable image → product page */}
                <a href={`${FRONT_URL}/products/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  <div style={{ height: 130, background: C.bg, overflow: "hidden" }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-regular fa-image" style={{ fontSize: "2rem", color: C.border }} /></div>
                    }
                  </div>
                </a>
                <div style={{ padding: "10px 10px 4px" }}>
                  <a href={`${FRONT_URL}/products/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: F, fontWeight: 600, color: C.text, fontSize: "0.8rem", lineHeight: 1.3, display: "block", marginBottom: 5, textDecoration: "none" }}>
                    {p.name}
                  </a>
                  <StatusBadge status={p.status} visible={p.visible} />
                </div>
                <div style={{ padding: "6px 8px 8px", display: "flex", gap: 4, borderTop: `1px solid ${C.border}`, marginTop: 6 }}>
                  <IconBtn icon="fa-copy"  title="Duplicate" onClick={() => handleDuplicate(p)} />
                  <IconBtn icon="fa-trash" title="Delete"    onClick={() => setConfirmDel(p)} color={C.danger} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ══ PRODUCT FORM MODAL ══ */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Edit: ${editing.name}` : "New Product"} width={720}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Featured Image — button first, large centered preview */}
          <SectionLabel label="Featured Image" />
          {/* Hidden file input — always present so we can trigger it */}
          <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) { handleThumbFiles(e.target.files[0]); e.target.value = ""; } }} />

          {form.thumbnail ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: "100%", maxWidth: 340, height: 200, borderRadius: 10, overflow: "hidden", border: `2px solid ${C.border}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={form.thumbnail} alt="Featured" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn size="sm" label={upThumb ? "Uploading…" : "Replace Image"} icon="fa-arrow-up-from-bracket" disabled={upThumb} onClick={() => thumbInputRef.current?.click()} />
                <Btn size="sm" label="Remove" variant="ghost" icon="fa-xmark" onClick={() => setForm(f => ({ ...f, thumbnail: "" }))} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Primary button */}
              <button type="button" disabled={upThumb} onClick={() => thumbInputRef.current?.click()}
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px dashed ${C.border}`, background: C.bg, color: C.primary, fontFamily: F, fontWeight: 600, fontSize: "0.85rem", cursor: upThumb ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryXlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
                {upThumb ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <><i className="fa-solid fa-image" /> Add Featured Image</>}
              </button>
              {/* Also drag-drop as fallback */}
              <ImageUploader onUpload={handleThumbFiles} label="or drag & drop here" uploading={upThumb} />
            </div>
          )}

          {/* Basic info */}
          <SectionLabel label="Basic Info" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Product Name" value={form.name} onChange={handleNameChange} placeholder="e.g. Nordex 9kW" required />
            <Field label="Slug" value={form.slug} onChange={e => { setSlugEdited(true); setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })); }} placeholder="nordex-9kw" required helper="Auto-generated · editable" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="SAWO" />
            <Field label="Type / Model" value={form.type}  onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Premium Series" />
          </div>
          <Field label="Short Description" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One-line summary" />
          <RichField label="Full Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          {/* Taxonomy */}
          <SectionLabel label="Categories & Tags" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <PillInput label="Categories" value={form.categories} onChange={v => setForm(f => ({ ...f, categories: v }))} placeholder="e.g. Wall-Mounted" suggestions={allCats} onNewItem={onNewCategory} />
            <PillInput label="Tags" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="e.g. electric, 9kW" suggestions={allTags} onNewItem={onNewTag} />
          </div>
          <PillInput label="Features" value={form.features} onChange={v => setForm(f => ({ ...f, features: v }))} placeholder="e.g. Auto shutoff" />

          {/* Additional images */}
          <SectionLabel label="Gallery Images" />
          {form.images.length > 0 ? (
            <>
              <ImageStrip images={form.images} onRemove={i => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 6, cursor: upImgs ? "not-allowed" : "pointer", fontFamily: F, fontSize: "0.78rem", fontWeight: 600, color: C.textMid, marginTop: 6, opacity: upImgs ? 0.7 : 1, width: "fit-content" }}>
                <i className="fa-solid fa-plus" />
                {upImgs ? "Uploading…" : "Add More Images"}
                <input type="file" accept="image/*" multiple onChange={e => e.target.files?.length && uploadMoreImages(Array.from(e.target.files))} style={{ display: "none" }} disabled={upImgs} />
              </label>
            </>
          ) : (
            <ImageUploader onUpload={uploadMoreImages} label="Upload Gallery Images (multiple)" multiple uploading={upImgs} />
          )}

          {/* Spec images */}
          <SectionLabel label="Spec / Diagram Images" />
          {form.spec_images.length > 0 ? (
            <>
              <ImageStrip images={form.spec_images} onRemove={i => setForm(f => ({ ...f, spec_images: f.spec_images.filter((_, idx) => idx !== i) }))} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 6, cursor: upSpec ? "not-allowed" : "pointer", fontFamily: F, fontSize: "0.78rem", fontWeight: 600, color: C.textMid, marginTop: 6, opacity: upSpec ? 0.7 : 1, width: "fit-content" }}>
                <i className="fa-solid fa-plus" />
                {upSpec ? "Uploading…" : "Add More Spec Images"}
                <input type="file" accept="image/*" multiple onChange={e => e.target.files?.length && uploadSpecImages(Array.from(e.target.files))} style={{ display: "none" }} disabled={upSpec} />
              </label>
            </>
          ) : (
            <ImageUploader onUpload={uploadSpecImages} label="Upload Spec Images" multiple uploading={upSpec} />
          )}

          {/* Status */}
          <SectionLabel label="Status & Visibility" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "start" }}>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 20 }}>
              <Toggle label="Visible"  checked={form.visible}  onChange={v => setForm(f => ({ ...f, visible: v }))} helper="Show on website" />
              <Toggle label="Featured" checked={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />
            </div>
            <Field label="Sort Order" type="number" value={String(form.sort_order)} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} helper="Lower = shown first" />
          </div>

          {!editing && currentUser && (
            <div style={{ padding: "7px 11px", background: C.bg, borderRadius: 6, fontSize: "0.72rem", color: C.textMid, fontFamily: F }}>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: 6 }} />
              Will be created by <strong>@{currentUser.username}</strong>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <Btn label="Cancel" variant="ghost" onClick={closeModal} />
            <Btn loading={saving} label={editing ? "Save Changes" : "Create Product"} icon="fa-check" type="submit" />
          </div>
        </form>
      </Modal>

      <Confirm open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={handleDelete} title="Delete Product?" message={`Delete "${confirmDel?.name}"? This cannot be undone.`} confirmLabel="Delete" />
      <Confirm open={confirmBulk === "delete"} onClose={() => setConfirmBulk(null)} onConfirm={() => handleBulk("delete")} title="Delete Selected?" message={`Permanently delete ${selected.length} product(s)?`} confirmLabel="Delete All" />
    </PageShell>
  );
}

const selStyle = { padding: "7px 10px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.8rem", background: "var(--c-surface)", color: "var(--c-text)", outline: "none" };
const TH = { padding: "9px 12px", textAlign: "center", color: C.textLight, fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", verticalAlign: "middle" };
