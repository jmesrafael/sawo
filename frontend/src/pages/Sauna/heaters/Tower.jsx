// Tower.jsx

import React, { useState } from "react";
import ButtonClear from "../../../components/Buttons/ButtonClear";
import CirclesInfo from "../../../components/CirclesInfo";
import productsData from "../../../assets/data/products.json";
import heroImg from "../../../assets/Sauna/Sauna Heaters/tower-hero.webp";
import "./heaters.css";

// ── Fixed group order ─────────────────────────────────────────────────
const FIXED_ORDER = ["SAWO30", "Tower", "Aries", "Cubos", "Heaterking", "Phoenix", "Fiberjungle"];

// ── Filter Tower products ─────────────────────────────────────────────
const towerProducts = productsData.filter((p) => {
  const name = p.name.toUpperCase();
  return (
    name.includes("SAWO30") ||
    name.includes("TOWER") ||
    name.includes("ARIES") ||
    name.includes("CUBOS") ||
    name.includes("HEATERKING") ||
    name.includes("PHOENIX") ||
    name.includes("FIBERJUNGLE NS")
  );
});

function getSeriesName(name = "") {
  const u = name.toUpperCase();
  if (u.includes("SAWO30"))         return "SAWO30";
  if (u.includes("ARIES"))          return "Aries";
  if (u.includes("CUBOS"))          return "Cubos";
  if (u.includes("HEATERKING"))     return "Heaterking";
  if (u.includes("PHOENIX"))        return "Phoenix";
  if (u.includes("FIBERJUNGLE NS")) return "Fiberjungle";
  if (u.includes("TOWER"))          return "Tower";
  return "Other";
}

function getType(name = "") {
  const u = name.toUpperCase();
  if (u.includes("ROUND"))  return "Round";
  if (u.includes("WALL"))   return "Wall";
  if (u.includes("CORNER")) return "Corner";
  return "Other";
}

const groupedProducts = towerProducts.reduce((groups, product) => {
  const series = getSeriesName(product.name);
  if (!groups[series]) groups[series] = [];
  groups[series].push(product);
  return groups;
}, {});

const groupNames = FIXED_ORDER.filter((g) => groupedProducts[g]);

function getPower(tags) {
  if (!tags) return "";
  return tags.find((t) => /\d+(\.\d+)?\s*[-–]\s*\d+(\.\d+)?\s*kW/i.test(t)) || "";
}

function ProductCard({ product }) {
  let productImage = null;
  try {
    if (product.image) {
      productImage = require(`../../../assets/products/${product.image.split("/").pop()}`);
    }
  } catch (e) {}
  const power = getPower(product.tags);
  return (
    <div className="wm-product-item">
      <div className="wm-product-img-wrap">
        {productImage ? (
          <img src={productImage} alt={product.name} className="wm-product-img" />
        ) : (
          <div className="wm-product-img-placeholder"><i className="fas fa-image" /></div>
        )}
      </div>
      <p className="wm-product-name">{product.name}</p>
      {power && <p className="wm-product-power">{power}</p>}
    </div>
  );
}

const Tower = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeType,  setActiveType]  = useState("All");

  const filteredGroups = groupNames.reduce((acc, series) => {
    if (activeGroup && series !== activeGroup) return acc;
    const products = (groupedProducts[series] || []).filter((p) =>
      activeType === "All" ? true : getType(p.name) === activeType,
    );
    if (products.length) acc[series] = products;
    return acc;
  }, {});

  return (
    <div className="relative">
      {/* HERO */}
      <section
        className="wm-hero min-h-[95vh] flex flex-col justify-center items-center text-center px-6 relative"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="wm-hero-overlay" />
        <div className="wm-hero-content">
          <h1 className="wm-hero-title">TOWER SAUNA HEATERS</h1>
          <p className="wm-hero-subtitle">Efficient, Sleek, Wellness-Focused Saunas</p>
          <div style={{ marginTop: "32px" }}>
            <ButtonClear text="EXPLORE HEATERS" href="https://www.sawo.com/sawo-products/finnish-sauna/sauna-heaters/sauna-products/" />
          </div>
        </div>
      </section>

      {/* INTRODUCING */}
      <section className="wm-section">
        <div className="wm-container text-center">
          <h2 className="wm-products-title">Introducing Our Premium Sauna Tower Heaters</h2>
          <p className="wm-products-desc">
            Indulge in modern, energy-efficient saunas designed for relaxation and wellness, with sleek
            aesthetics and superior comfort. Experience superior heat distribution and elegant design
            with our premium sauna tower heaters.
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="wm-section wm-section--flush-bottom">
        <div className="wm-container">
          <div className="wm-filter-wrap">
            <button className={`wm-filter-btn ${activeGroup === null ? "wm-filter-btn--active" : ""}`} onClick={() => setActiveGroup(null)}>All</button>
            {groupNames.map((g) => (
              <button key={g} className={`wm-filter-btn ${activeGroup === g ? "wm-filter-btn--active" : ""}`} onClick={() => setActiveGroup(g)}>{g}</button>
            ))}
          </div>
          <div className="wm-filter-wrap" style={{ marginTop: "10px" }}>
            {["All", "Round", "Wall", "Corner"].map((type) => (
              <button key={type} className={`wm-filter-btn ${activeType === type ? "wm-filter-btn--active" : ""}`} onClick={() => setActiveType(type)}>{type}</button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="wm-section wm-section--flush-top">
        <div className="wm-container">
          {groupNames.map((series, gi) => {
            const products = filteredGroups[series];
            if (!products) return null;
            return (
              <div className="wm-group" key={gi}>
                <h3 className="wm-group-title">{series.toUpperCase()}</h3>
                <div className="wm-products-grid">
                  {products.map((product, ii) => <ProductCard key={ii} product={product} />)}
                </div>
              </div>
            );
          })}
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
              <p className="wm-why-desc">User-Friendly Controls — Easily adjust temperature and time settings for your perfect sauna experience.</p>
              <div style={{ marginTop: "20px" }}>
                <a href="https://www.sawo.com/wp-content/uploads/2025/12/SAWO-Product-Catalogue-2025-2026-web.pdf" target="_blank" rel="noopener noreferrer" className="wm-brochure-btn">VIEW BROCHURE</a>
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

export default Tower;
