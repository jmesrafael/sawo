// src/admin/LayoutPage.jsx — v5: drag-drop visual product layout builder
import React, { useEffect, useState, useRef } from "react";
import { apiGetProductLayout, apiSaveProductLayout, apiGetProducts } from "../lib/api";
import { Toast, useToast, Btn, Card, Toggle, PageShell, C, F } from "./ui";

const DEFAULT_BLOCKS = [
  { id: "hero",        type: "hero",        label: "Hero (Image + Name + Brand)", enabled: true,  order: 1, settings: { showBrand: true, showType: true } },
  { id: "short_desc",  type: "short_desc",  label: "Short Description",            enabled: true,  order: 2, settings: {} },
  { id: "gallery",     type: "gallery",     label: "Image Gallery",                enabled: true,  order: 3, settings: { columns: 4 } },
  { id: "description", type: "description", label: "Full Description",             enabled: true,  order: 4, settings: {} },
  { id: "features",    type: "features",    label: "Features List",                enabled: true,  order: 5, settings: { style: "bullets" } },
  { id: "spec_images", type: "spec_images", label: "Spec / Diagrams",              enabled: false, order: 6, settings: {} },
  { id: "tags",        type: "tags",        label: "Tags & Categories",            enabled: true,  order: 7, settings: {} },
];

// ── Block preview renderer (shows actual product data in preview) ─────
function BlockPreview({ block, product }) {
  const s = { fontFamily: F, padding: "12px 16px", marginBottom: 8, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface };

  if (!block.enabled) return null;

  switch (block.type) {
    case "hero":
      return (
        <div style={{ ...s, padding: 0, overflow: "hidden" }}>
          {product?.thumbnail && (
            <div style={{ width: "100%", height: 160, overflow: "hidden", background: C.bg }}>
              <img src={product.thumbnail} alt={product?.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
          <div style={{ padding: "12px 16px" }}>
            <h2 style={{ margin: "0 0 4px", color: C.text, fontWeight: 700, fontSize: "1.1rem" }}>{product?.name || "Product Name"}</h2>
            {block.settings?.showBrand && product?.brand && <span style={{ fontSize: "0.75rem", color: C.textLight }}>{product.brand}</span>}
            {block.settings?.showType  && product?.type  && <span style={{ fontSize: "0.75rem", color: C.textLight, marginLeft: 8 }}>{product.type}</span>}
          </div>
        </div>
      );
    case "short_desc":
      return <div style={s}><p style={{ margin: 0, color: C.textMid, fontSize: "0.9rem", lineHeight: 1.6 }}>{product?.short_description || "Short description appears here."}</p></div>;
    case "description":
      return <div style={s}><div style={{ color: C.textMid, fontSize: "0.85rem", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: product?.description || "<p>Full description appears here.</p>" }} /></div>;
    case "gallery":
      return (
        <div style={s}>
          <p style={{ fontSize: "0.65rem", color: C.textLight, textTransform: "uppercase", fontWeight: 700, margin: "0 0 8px" }}>Gallery</p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${block.settings?.columns || 4}, 1fr)`, gap: 6 }}>
            {(product?.images?.length ? product.images : ["", "", ""]).slice(0, 8).map((url, i) => (
              <div key={i} style={{ aspectRatio: "1/1", borderRadius: 6, background: C.bg, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {url && <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
          </div>
        </div>
      );
    case "features":
      return (
        <div style={s}>
          <p style={{ fontSize: "0.65rem", color: C.textLight, textTransform: "uppercase", fontWeight: 700, margin: "0 0 8px" }}>Features</p>
          {block.settings?.style === "bullets"
            ? <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {(product?.features?.length ? product.features : ["Feature one", "Feature two", "Feature three"]).map((f, i) => (
                  <li key={i} style={{ color: C.textMid, fontSize: "0.82rem", marginBottom: 4 }}>{f}</li>
                ))}
              </ul>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(product?.features?.length ? product.features : ["Feature one", "Feature two"]).map((f, i) => (
                  <span key={i} style={{ background: C.primaryXlt, color: C.primary, padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem" }}>{f}</span>
                ))}
              </div>
          }
        </div>
      );
    case "spec_images":
      return (
        <div style={s}>
          <p style={{ fontSize: "0.65rem", color: C.textLight, textTransform: "uppercase", fontWeight: 700, margin: "0 0 8px" }}>Spec Diagrams</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(product?.spec_images || []).slice(0, 4).map((url, i) => (
              <img key={i} src={url} alt="" style={{ height: 80, borderRadius: 6, border: `1px solid ${C.border}` }} />
            ))}
            {!product?.spec_images?.length && <div style={{ color: C.textLight, fontSize: "0.8rem" }}>Spec images appear here</div>}
          </div>
        </div>
      );
    case "tags":
      return (
        <div style={s}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(product?.categories || ["Wall-Mounted", "Heaters"]).map((c, i) => (
              <span key={i} style={{ background: C.primaryXlt, color: C.primary, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>{c}</span>
            ))}
            {(product?.tags || ["electric", "9kW"]).map((t, i) => (
              <span key={i} style={{ background: C.infoLt, color: C.info, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ── Draggable block row ───────────────────────────────────────────────
function BlockRow({ block, index, total, onToggle, onMove, onSetting }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div draggable onDragStart={() => setDragging(true)} onDragEnd={() => setDragging(false)}
      style={{ display: "grid", gridTemplateColumns: "24px 1fr auto auto", gap: 10, alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: dragging ? C.primaryXlt : C.surface, cursor: "grab", transition: "background 0.15s", opacity: block.enabled ? 1 : 0.5 }}
      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onMove(index); }}>

      {/* Drag handle */}
      <i className="fa-solid fa-grip-vertical" style={{ color: C.border, fontSize: "0.9rem", cursor: "grab" }} />

      {/* Label */}
      <div>
        <span style={{ fontFamily: F, fontWeight: 600, fontSize: "0.84rem", color: C.text }}>{block.label}</span>
        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.textLight, marginLeft: 8 }}>{block.type}</span>
      </div>

      {/* Settings (simple) */}
      {block.type === "gallery" && (
        <select value={block.settings?.columns || 4} onChange={e => onSetting(block.id, "columns", parseInt(e.target.value))}
          style={{ padding: "3px 6px", borderRadius: 5, border: `1px solid ${C.border}`, fontFamily: F, fontSize: "0.72rem", background: C.surface, color: C.text }}>
          {[2, 3, 4, 6].map(n => <option key={n} value={n}>{n} cols</option>)}
        </select>
      )}
      {block.type === "features" && (
        <select value={block.settings?.style || "bullets"} onChange={e => onSetting(block.id, "style", e.target.value)}
          style={{ padding: "3px 6px", borderRadius: 5, border: `1px solid ${C.border}`, fontFamily: F, fontSize: "0.72rem", background: C.surface, color: C.text }}>
          <option value="bullets">Bullets</option>
          <option value="pills">Pills</option>
        </select>
      )}
      {block.type === "hero" && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <label style={{ fontFamily: F, fontSize: "0.68rem", color: C.textLight, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={block.settings?.showBrand || false} onChange={e => onSetting(block.id, "showBrand", e.target.checked)} />
            Brand
          </label>
          <label style={{ fontFamily: F, fontSize: "0.68rem", color: C.textLight, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input type="checkbox" checked={block.settings?.showType || false} onChange={e => onSetting(block.id, "showType", e.target.checked)} />
            Type
          </label>
        </div>
      )}
      {!["gallery", "features", "hero"].includes(block.type) && <div />}

      {/* Toggle */}
      <Toggle checked={block.enabled} onChange={() => onToggle(block.id)} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function LayoutPage() {
  const { toasts, add, remove } = useToast();
  const [blocks, setBlocks]       = useState(DEFAULT_BLOCKS);
  const [loading, setLoading]     = useState(false);
  const [preview, setPreview]     = useState(null);
  const [products, setProducts]   = useState([]);
  const [selectedProd, setSelectedProd] = useState(null);
  const dragFrom = useRef(null);

  useEffect(() => {
    apiGetProductLayout().then(d => { if (d?.blocks?.length) setBlocks(d.blocks); }).catch(() => {});
    apiGetProducts({ status: "published" }).then(data => {
      setProducts(data);
      if (data.length) setSelectedProd(data[0]);
    }).catch(() => {});
  }, []);

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const onToggle  = (id) => setBlocks(bs => bs.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  const onSetting = (id, key, val) => setBlocks(bs => bs.map(b => b.id === id ? { ...b, settings: { ...b.settings, [key]: val } } : b));

  // Drag-and-drop reorder
  const onDragStart = (i)  => { dragFrom.current = i; };
  const onDrop      = (i)  => {
    if (dragFrom.current === null || dragFrom.current === i) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(dragFrom.current, 1);
    reordered.splice(i, 0, moved);
    reordered.forEach((b, idx) => b.order = idx + 1);
    setBlocks(reordered);
    dragFrom.current = null;
  };

  const handleSave = async () => {
    setLoading(true);
    try { await apiSaveProductLayout({ blocks }); add("Layout saved.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <PageShell title="Product Layout" subtitle="Drag blocks to reorder · Toggle to show/hide · Live preview on the right"
      action={<Btn loading={loading} label="Save Layout" icon="fa-floppy-disk" onClick={handleSave} />}>
      <Toast toasts={toasts} remove={remove} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Block editor ── */}
        <Card>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center" }}>
            <i className="fa-solid fa-table-cells" style={{ color: C.primary }} />
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: "0.85rem", color: C.text }}>Page Blocks</span>
            <span style={{ fontFamily: F, fontSize: "0.72rem", color: C.textLight, marginLeft: 4 }}>Drag to reorder</span>
          </div>
          {sorted.map((block, i) => (
            <div key={block.id} draggable
              onDragStart={() => onDragStart(i)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(i)}>
              <BlockRow block={block} index={i} total={sorted.length} onToggle={onToggle} onMove={onDrop} onSetting={onSetting} />
            </div>
          ))}
        </Card>

        {/* ── RIGHT: Live preview ── */}
        <div>
          <Card style={{ marginBottom: 10, padding: "10px 14px" }}>
            <div style={{ fontFamily: F, fontSize: "0.7rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", marginBottom: 6 }}>Preview with product</div>
            <select value={selectedProd?.id || ""} onChange={e => setSelectedProd(products.find(p => p.id === e.target.value))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontFamily: F, fontSize: "0.82rem", background: C.surface, color: C.text }}>
              <option value="">— sample data —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Card>

          <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ fontFamily: F, fontSize: "0.65rem", color: C.textLight, textTransform: "uppercase", fontWeight: 700, marginBottom: 10, textAlign: "center" }}>
              ← Product Page Preview →
            </div>
            {sorted.filter(b => b.enabled).map(block => (
              <BlockPreview key={block.id} block={block} product={selectedProd} />
            ))}
            {sorted.filter(b => b.enabled).length === 0 && (
              <p style={{ textAlign: "center", color: C.textLight, fontFamily: F, fontSize: "0.82rem" }}>Enable some blocks to see preview</p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card style={{ marginTop: 16, padding: "14px 18px", background: C.primaryXlt, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: F, fontSize: "0.78rem", color: C.textMid, margin: 0, lineHeight: 1.7 }}>
          <strong>How it works:</strong> This layout is fetched at <code>/api/product-layout</code> and applied automatically to every product page at <code>/products/:slug</code>.
          When a product card is clicked (in WallMounted or the product list), it opens that URL and renders using this block configuration.
          Blocks with no data for a given product are automatically hidden on the live page.
        </p>
      </Card>
    </PageShell>
  );
}
