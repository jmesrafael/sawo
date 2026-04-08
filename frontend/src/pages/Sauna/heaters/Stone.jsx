// Stone.jsx

import React, { useState } from "react";
import ButtonClear from "../../../components/Buttons/ButtonClear";
import CirclesInfo from "../../../components/CirclesInfo";
import productsData from "../../../assets/data/products.json";
import heroImg from "../../../assets/Sauna/Sauna Heaters/stone-hero.webp";
import "./heaters.css";

// ── Fixed group order ─────────────────────────────────────────────────
const FIXED_ORDER = ["Cumulus", "Nimbus"];

// ── Keywords to detect group membership ───────────────────────────────
const GROUP_KEYWORDS = {
  Cumulus: ["Cumulus"],
  Nimbus: ["Nimbus"],
};

// ── Filter Stone products dynamically ────────────────────────────────
const stoneProducts = productsData.filter(
  (p) =>
    p.categories?.includes("Stone") || // category contains Stone
    p.name?.toLowerCase().includes("stone") // name contains "stone"
);

// ── Group products dynamically ───────────────────────────────────────
const groupedProducts = stoneProducts.reduce((groups, product) => {
  let assigned = false;
  for (const [group, keywords] of Object.entries(GROUP_KEYWORDS)) {
    for (const kw of keywords) {
      const nameMatch = product.name?.toLowerCase().includes(kw.toLowerCase());
      const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(kw.toLowerCase()));
      if (nameMatch || tagMatch) {
        if (!groups[group]) groups[group] = [];
        groups[group].push(product);
        assigned = true;
        break;
      }
    }
    if (assigned) break;
  }

  // If no match, assign to Other
  if (!assigned) {
    if (!groups["Other"]) groups["Other"] = [];
    groups["Other"].push(product);
  }

  return groups;
}, {});

// Only show groups in fixed order that exist
const groupNames = FIXED_ORDER.filter((g) => groupedProducts[g]);

// ── Extract power range from tags ─────────────────────────────────────
function getPower(tags) {
  if (!tags) return "";
  return tags.find((t) => /\d+(\.\d+)?\s*[-–]\s*\d+(\.\d+)?\s*kW/i.test(t)) || "";
}

// ── Product card component ───────────────────────────────────────────
function ProductCard({ product }) {
  let productImage = null;
  try {
    if (product.image) {
      productImage = require(`../../../assets/products/${product.image.split("/").pop()}`);
    }
  } catch (e) {
    console.warn(`Image not found: ${product.image}`);
  }

  const power = getPower(product.tags);

  return (
    <div className="wm-product-item">
      <div className="wm-product-img-wrap">
        {productImage ? (
          <img src={productImage} alt={product.name} className="wm-product-img" />
        ) : (
          <div className="wm-product-img-placeholder">
            <i className="fas fa-image" />
          </div>
        )}
      </div>
      <p className="wm-product-name">{product.name}</p>
      {power && <p className="wm-product-power">{power}</p>}
    </div>
  );
}

// ── Stone page ───────────────────────────────────────────────────────
const Stone = () => {
  const [activeGroup, setActiveGroup] = useState(null);

  const visibleGroups = activeGroup
    ? groupNames.filter((g) => g === activeGroup)
    : groupNames;

  return (
    <div className="relative">
      {/* HERO */}
      <section
        className="wm-hero min-h-[95vh] flex flex-col justify-center items-center text-center px-6 relative"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="wm-hero-overlay" />
        <div className="wm-hero-content">
          <h1 className="wm-hero-title">SAUNA STONE SERIES</h1>
          <p className="wm-hero-subtitle">Efficient, Sleek, Wellness-Focused Saunas.</p>
          <div style={{ marginTop: "32px" }}>
            <ButtonClear
              text="EXPLORE HEATERS"
              href="https://www.sawo.com/sawo-products/finnish-sauna/sauna-heaters/sauna-products/"
            />
          </div>
        </div>
      </section>

      {/* INTRODUCING */}
      <section className="wm-section">
        <div className="wm-container text-center">
          <h2 className="wm-products-title">Introducing Our Premium Sauna Stone Series</h2>
          <p className="wm-products-desc">
            Indulge in modern, energy-efficient saunas designed for relaxation and wellness, with sleek
            aesthetics and superior comfort. Our Stone Heaters are made from all stone or a combination
            of stainless steel and stone. You get excellent heat conduction from Finnish soapstone,
            which enhances your sauna experience and dries your sauna room faster after use.
          </p>
        </div>
      </section>

      {/* FILTER */}
      <section className="wm-section wm-section--flush-bottom">
        <div className="wm-container">
          <div className="wm-filter-wrap">
            <button className={`wm-filter-btn ${activeGroup === null ? "wm-filter-btn--active" : ""}`} onClick={() => setActiveGroup(null)}>All</button>
            {groupNames.map((g) => (
              <button key={g} className={`wm-filter-btn ${activeGroup === g ? "wm-filter-btn--active" : ""}`} onClick={() => setActiveGroup(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="wm-section wm-section--flush-top">
        <div className="wm-container">
          {visibleGroups.map((brand, gi) => (
            <div className="wm-group" key={gi}>
              <h3 className="wm-group-title">{brand.toUpperCase()}</h3>
              <div className="wm-products-grid">
                {(groupedProducts[brand] || []).map((product, ii) => (
                  <ProductCard key={ii} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SAWO */}
      <section className="wm-section">
        <div className="wm-container">
          <div className="wm-why-grid">
            <div className="wm-why-left">
              <p className="wm-eyebrow">SAWO HEATERS</p>
              <h2 className="wm-why-title">Why Choose SAWO Heaters</h2>
              <p className="wm-why-desc">SAWO heaters combine durability, energy efficiency, and modern design, offering consistent performance for a reliable, superior sauna experience every time.</p>
              <p className="wm-why-desc">Durable Construction — High-quality materials ensure long-lasting performance.</p>
              <div style={{ marginTop: "20px" }}>
                <a href="https://www.sawo.com/wp-content/uploads/2025/12/Stone-SeriesRV1_compressed.pdf" target="_blank" rel="noopener noreferrer" className="wm-brochure-btn">VIEW BROCHURE</a>
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
};

export default Stone;