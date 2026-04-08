// src/admin/DetailsPage.jsx
import React, { useState } from "react";
import { PageShell, Card, SectionLabel, C } from "./ui";

const F = "'Inter', 'Montserrat', system-ui, sans-serif";
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: "relative" }}>
      <pre style={{ background: "#1E1E1E", color: "#D4D4D4", borderRadius: 8, padding: "14px 16px", fontSize: "0.75rem", fontFamily: "monospace", overflowX: "auto", margin: 0, lineHeight: 1.7 }}>
        <code>{code}</code>
      </pre>
      <button type="button" onClick={copy}
        style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", background: copied ? C.success : "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 5, cursor: "pointer", color: "#fff", fontFamily: F, fontSize: "0.7rem", transition: "all 0.2s" }}>
        <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} style={{ marginRight: 4 }} />
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ padding: "13px 18px", borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontFamily: F, fontWeight: 700, color: C.text, margin: 0, fontSize: "0.9rem" }}>{title}</h3>
      </div>
      <div style={{ padding: "14px 18px" }}>{children}</div>
    </Card>
  );
}

function Param({ name, type, desc }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 80px 1fr", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: F, fontSize: "0.78rem" }}>
      <code style={{ color: C.primary, fontFamily: "monospace", fontSize: "0.75rem" }}>{name}</code>
      <span style={{ color: C.info, fontSize: "0.72rem" }}>{type}</span>
      <span style={{ color: C.textMid }}>{desc}</span>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <PageShell title="Details & Integration" subtitle="How to use the admin system in your frontend">
      <div style={{ fontFamily: F }}>

        {/* ── Public Endpoints ── */}
        <SectionLabel label="Public API Endpoints (no auth required)" />

        <Sec title="GET /api/public/products — Fetch all published products">
          <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 10px", lineHeight: 1.6 }}>
            Returns only <strong>published</strong> + <strong>visible</strong> products, ordered by <code>sort_order</code>. Use this on all public-facing pages.
          </p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.textLight, textTransform: "uppercase", margin: "0 0 5px" }}>Query Parameters</p>
            <Param name="category" type="string" desc='Filter by category, e.g. category=Wall-Mounted' />
            <Param name="tag"      type="string" desc='Filter by tag, e.g. tag=electric' />
          </div>
          <CodeBlock code={`// Fetch all published wall-mounted products
const res = await fetch('${API}/api/public/products?category=Wall-Mounted');
const products = await res.json();
// products = [{ id, name, slug, thumbnail, categories, tags, ... }]`} />
        </Sec>

        <Sec title="GET /api/public/products/:slug — Fetch a single product">
          <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 10px", lineHeight: 1.6 }}>
            Fetch one product by its slug. Returns 404 if not found or not published.
          </p>
          <CodeBlock code={`const res = await fetch('${API}/api/public/products/nordex-9kw');
const product = await res.json();
// product = { id, name, slug, description, images, features, ... }`} />
        </Sec>

        <Sec title="GET /api/layout — Fetch layout config">
          <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 10px", lineHeight: 1.6 }}>
            Returns the section layout configured in the Layout page. Use this to know which sections to show.
          </p>
          <CodeBlock code={`const res = await fetch('${API}/api/layout');
const layout = await res.json();
const sections = layout.config.sections;
// sections = [{ key, label, enabled, order }, ...]`} />
        </Sec>

        {/* ── WallMounted.jsx Integration ── */}
        <SectionLabel label="WallMounted.jsx — Replacing static JSON with live data" />

        <Sec title="How to fetch products from the admin in WallMounted.jsx">
          <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 12px", lineHeight: 1.6 }}>
            Replace the static <code>productsData</code> import with a live fetch from the API. Products are grouped and filtered client-side exactly like before.
          </p>
          <CodeBlock code={`// WallMounted.jsx — full integration example
import React, { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

const FIXED_ORDER = [
  "Nordex", "Nordex Mini", "Nordex Combi", "Nordex Mini Combi",
  "Mini", "Mini Combi", "Scandia", "Scandia Combi", "Krios", "Scandifire",
];

export default function WallMounted() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    fetch(\`\${API}/api/public/products?category=Wall-Mounted\`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group by first tag (same as before)
  const grouped = products.reduce((acc, p) => {
    const tag = p.tags?.[0] || "Other";
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(p);
    return acc;
  }, {});

  const groupNames = FIXED_ORDER.filter(g => grouped[g]);
  const visible    = activeGroup ? groupNames.filter(g => g === activeGroup) : groupNames;

  if (loading) return <div>Loading products…</div>;

  return (
    <div>
      {/* Filter buttons */}
      <div className="wm-filter-wrap">
        <button onClick={() => setActiveGroup(null)} className={\`wm-filter-btn \${!activeGroup ? "wm-filter-btn--active" : ""}\`}>All</button>
        {groupNames.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)} className={\`wm-filter-btn \${activeGroup === g ? "wm-filter-btn--active" : ""}\`}>{g}</button>
        ))}
      </div>

      {/* Product groups */}
      {visible.map(brand => (
        <div key={brand} className="wm-group">
          <h3 className="wm-group-title">{brand.toUpperCase()}</h3>
          <div className="wm-products-grid">
            {(grouped[brand] || []).map(p => (
              <div key={p.id} className="wm-product-item">
                <div className="wm-product-img-wrap">
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.name} className="wm-product-img" />
                    : <div className="wm-product-img-placeholder"><i className="fas fa-image" /></div>
                  }
                </div>
                <p className="wm-product-name">{p.name}</p>
                {p.tags?.find(t => /kW/i.test(t)) && (
                  <p className="wm-product-power">{p.tags.find(t => /kW/i.test(t))}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}`} />
        </Sec>

        {/* ── Product data shape ── */}
        <SectionLabel label="Product Data Shape" />

        <Sec title="Fields returned by /api/public/products">
          <div style={{ marginBottom: 4 }}>
            <Param name="id"                type="uuid"     desc="Unique product identifier" />
            <Param name="name"              type="string"   desc="Product display name" />
            <Param name="slug"              type="string"   desc="URL-friendly identifier — use for routing" />
            <Param name="short_description" type="string"   desc="One-line summary for list views" />
            <Param name="description"       type="string"   desc="Full HTML or plain text description" />
            <Param name="thumbnail"         type="string"   desc="Main product image URL" />
            <Param name="images"            type="string[]" desc="Additional gallery image URLs" />
            <Param name="spec_images"       type="string[]" desc="Spec/diagram image URLs" />
            <Param name="categories"        type="string[]" desc='e.g. ["Wall-Mounted", "Heaters"]' />
            <Param name="tags"              type="string[]" desc='e.g. ["Nordex", "9kW", "electric"]' />
            <Param name="features"          type="string[]" desc='e.g. ["Auto shutoff", "Timer"]' />
            <Param name="brand"             type="string"   desc="Brand name, e.g. SAWO" />
            <Param name="type"              type="string"   desc="Model family / type" />
            <Param name="sort_order"        type="integer"  desc="Lower number = shown first" />
          </div>
        </Sec>

        {/* ── Product page routing ── */}
        <SectionLabel label="Individual Product Pages" />

        <Sec title="Routing to product detail pages by slug">
          <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 12px", lineHeight: 1.6 }}>
            Each product has a unique slug. Use it to create individual product URLs like <code>/products/nordex-9kw</code>.
          </p>
          <CodeBlock code={`// In App.jsx — add a product detail route:
<Route path="/products/:slug" element={<ProductDetail />} />

// In ProductDetail.jsx:
import { useParams } from "react-router-dom";
const { slug } = useParams();

useEffect(() => {
  fetch(\`${API}/api/public/products/\${slug}\`)
    .then(r => r.json())
    .then(setProduct);
}, [slug]);`} />
        </Sec>

        {/* ── Tips ── */}
        <SectionLabel label="Tips" />
        <Card style={{ padding: 16 }}>
          <ul style={{ fontFamily: F, fontSize: "0.82rem", color: C.textMid, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
            <li>Products in <strong>Draft</strong> status or with <strong>Visible = Off</strong> will never appear on the public frontend.</li>
            <li>Use <strong>Sort Order</strong> (lower = first) to control the display order on the frontend.</li>
            <li>The <strong>first tag</strong> on a product is used as the group/series name in WallMounted.jsx (e.g. "Nordex").</li>
            <li>Use the <strong>Gallery</strong> page to manage all uploaded images and copy their URLs.</li>
            <li>Use <strong>Duplicate</strong> to quickly create variants of a product.</li>
            <li>Set <strong>Featured = On</strong> to highlight products — you can filter by this on the frontend using the <code>featured</code> field.</li>
          </ul>
        </Card>

      </div>
    </PageShell>
  );
}
