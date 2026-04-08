// Floor.jsx

import React, { useState } from "react";
import ButtonClear from "../../../components/Buttons/ButtonClear";
import CirclesInfo from "../../../components/CirclesInfo";
import productsData from "../../../assets/data/products.json";
import heroImg from "../../../assets/Sauna/Sauna Heaters/floor-hero.webp";
import "./heaters.css";

// ── Fixed group order ───────────────────────────────────────────────
const FIXED_ORDER = ["Taurus D", "HELIUS", "Krios", "Savonia", "Nordex"];

// ── Map product tags to fixed group names ───────────────────────────
const TAG_TO_GROUP = {
  Taurus: "Taurus D",
  Helius: "HELIUS",
  "Krios Floor": "Krios",
  Krios: "Krios",
  Savonia: "Savonia",
  Nordex: "Nordex",
};

// ── Filter floor products from JSON ─────────────────────────────────
const floorProducts = productsData.filter((p) =>
  p.categories?.includes("Floor")
);

const groupedProducts = floorProducts.reduce((groups, product) => {
  const rawTag = product.tags?.[0] || "Other";
  const group = TAG_TO_GROUP[rawTag] || "Other";
  if (!groups[group]) groups[group] = [];
  groups[group].push(product);
  return groups;
}, {});

// Only keep groups that exist in data and in the fixed order
const groupNames = FIXED_ORDER.filter((g) => groupedProducts[g]);

// Helper to extract power from tags
function getPower(tags) {
  if (!tags) return "";
  const powerTag = tags.find((t) => /\d+(\.\d+)?\s*-\s*\d+(\.\d+)?kW/i.test(t));
  return powerTag || "";
}

const Floor = () => {
  const [activeGroup, setActiveGroup] = useState(null);

  const filteredGroups = activeGroup
    ? { [activeGroup]: groupedProducts[activeGroup] }
    : groupedProducts;

  return (
    <div className="relative">
      {/* HERO */}
      <section
        className="wm-hero min-h-[95vh] flex flex-col justify-center items-center text-center px-6 relative"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="wm-hero-overlay" />
        <div className="wm-hero-content">
          <h1 className="wm-hero-title">SAUNA FLOOR HEATERS</h1>
          <p className="wm-hero-subtitle">Superior Heat Distribution & Elegant Design</p>
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
          <h2 className="wm-products-title">
            Introducing Our Premium Floor Sauna Heaters
          </h2>
          <p className="wm-products-desc">
            Experience superior heat distribution and elegant design with our premium sauna floor
            heaters, crafted for ultimate relaxation and efficiency.
          </p>
        </div>
      </section>

      {/* FILTER */}
      <section className="wm-section" style={{ paddingBottom: "0" }}>
        <div className="wm-container">
          <div className="wm-filter-wrap">
            <button
              className={`wm-filter-btn ${activeGroup === null ? "wm-filter-btn--active" : ""}`}
              onClick={() => setActiveGroup(null)}
            >
              All
            </button>
            {groupNames.map((g) => (
              <button
                key={g}
                className={`wm-filter-btn ${activeGroup === g ? "wm-filter-btn--active" : ""}`}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="wm-section" style={{ paddingTop: "24px" }}>
        <div className="wm-container">
          {groupNames.map((brand, gi) => {
            const products = filteredGroups[brand] || [];
            return (
              <div className="wm-group" key={gi}>
                <h3 className="wm-group-title">{brand.toUpperCase()}</h3>
                <div className="wm-products-grid">
                  {products.map((product, ii) => {
                    let productImage = null;
                    try {
                      if (product.image) {
                        productImage = require(
                          `../../../assets/products/${product.image.split("/").pop()}`
                        );
                      }
                    } catch (err) {
                      console.warn(`Image not found: ${product.image}`);
                    }

                    const power = getPower(product.tags);

                    return (
                      <div className="wm-product-item" key={ii}>
                        <div className="wm-product-img-wrap">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="wm-product-img"
                            />
                          ) : (
                            <div className="wm-product-img-placeholder">
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                        </div>
                        <p className="wm-product-name">{product.name}</p>
                        {power && <p className="wm-product-power">{power}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY SAWO + CIRCLES */}
      <section className="wm-section">
        <div className="wm-container">
          <div className="wm-why-grid">
            <div className="wm-why-left">
              <p className="wm-eyebrow">SAWO HEATERS</p>
              <h2 className="wm-why-title">Why Choose SAWO Heaters</h2>
              <p className="wm-why-desc">
                SAWO heaters combine durability, energy efficiency, and modern design, offering
                consistent performance for a reliable, superior sauna experience every time.
              </p>
              <div style={{ marginTop: "24px" }}>
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
            <div className="wm-why-right">
              <CirclesInfo />
            </div>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="wm-banner">
        <div className="wm-banner-content">
          <h2 className="wm-banner-title">Experience Ultimate Relaxation</h2>
          <p className="wm-banner-sub">
            Find your source of serenity from over 100 heater models
          </p>
        </div>
      </section>
    </div>
  );
};

export default Floor;