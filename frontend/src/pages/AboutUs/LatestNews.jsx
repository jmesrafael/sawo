// LatestNews.jsx

import React, { useState } from "react";
import ButtonClear from "../../components/Buttons/ButtonClear";

const LatestNews = () => {
  const [filter, setFilter] = useState("all");

  const newsItems = [
    {
      id: 1,
      category: "product-launch",
      date: "April 2026",
      title: "New Stone Series 2026 Collection Launches",
      excerpt: "Introducing our latest premium stone heater collection featuring enhanced efficiency and sleek Nordic designs.",
      image: "🔥",
    },
    {
      id: 2,
      category: "innovation",
      date: "March 2026",
      title: "Infrared Technology Breakthrough",
      excerpt: "SAWO advances infrared sauna technology with deeper penetration and improved energy efficiency.",
      image: "⚡",
    },
    {
      id: 3,
      category: "award",
      date: "February 2026",
      title: "Named Best Sauna Brand 2026",
      excerpt: "SAWO recognized for excellence in sauna design and customer satisfaction.",
      image: "🏆",
    },
    {
      id: 4,
      category: "sustainability",
      date: "January 2026",
      title: "Carbon Neutral Production Achieved",
      excerpt: "SAWO becomes carbon neutral in all manufacturing operations across Finland.",
      image: "🌱",
    },
    {
      id: 5,
      category: "expansion",
      date: "December 2025",
      title: "North American Distribution Expanded",
      excerpt: "SAWO opens new distribution centers to serve US and Canadian markets.",
      image: "🌍",
    },
    {
      id: 6,
      category: "partnership",
      date: "November 2025",
      title: "Strategic Partnership with Interior Designers",
      excerpt: "Collaborate with leading designers to bring custom sauna solutions to luxury homes.",
      image: "🤝",
    },
  ];

  const filteredNews = filter === "all" ? newsItems : newsItems.filter(n => n.category === filter);

  return (
    <div className="relative">
      <style>{`
        .ln-hero {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          background: linear-gradient(135deg, #2c1f13 0%, #5c3d2a 50%, #2c1f13 100%);
          color: white;
        }
        .ln-hero h1 { font-size: 48px; font-weight: 700; margin-bottom: 16px; font-family: 'Montserrat', sans-serif; }
        .ln-hero p { font-size: 18px; opacity: 0.9; }
        .ln-section { padding: 48px 24px; max-width: 1200px; margin: 0 auto; }
        .ln-filters { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }
        .ln-filter-btn {
          padding: 8px 16px;
          border: 1px solid #e0d5c7;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
          color: #2c1f13;
        }
        .ln-filter-btn:hover, .ln-filter-btn.active {
          background: #a67853;
          color: white;
          border-color: #a67853;
        }
        .ln-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .ln-card {
          background: white;
          border: 1px solid #e0d5c7;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
        }
        .ln-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.12); border-color: #a67853; }
        .ln-card-image {
          background: linear-gradient(135deg, #f0ebe3 0%, #e8dfd5 100%);
          padding: 32px;
          text-align: center;
          font-size: 48px;
        }
        .ln-card-content { padding: 24px; }
        .ln-card-category {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          color: #a67853;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .ln-card-date { font-size: 12px; color: #999; margin-bottom: 12px; }
        .ln-card h3 { font-size: 18px; font-weight: 600; color: #2c1f13; margin: 12px 0; line-height: 1.4; }
        .ln-card p { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
        .ln-read-more { color: #a67853; text-decoration: none; font-weight: 600; font-size: 14px; }
        .ln-read-more:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .ln-hero h1 { font-size: 32px; }
          .ln-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="ln-hero">
        <div>
          <h1>LATEST NEWS</h1>
          <p>Stay updated with SAWO innovations, launches, and industry insights</p>
        </div>
      </section>

      {/* FILTERS + NEWS GRID */}
      <section className="ln-section" style={{ backgroundColor: "#f9f7f5" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2c1f13", textAlign: "center", marginBottom: "24px" }}>
          What's New
        </h2>

        <div className="ln-filters">
          <button
            className={`ln-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All News
          </button>
          <button
            className={`ln-filter-btn ${filter === "product-launch" ? "active" : ""}`}
            onClick={() => setFilter("product-launch")}
          >
            Product Launches
          </button>
          <button
            className={`ln-filter-btn ${filter === "innovation" ? "active" : ""}`}
            onClick={() => setFilter("innovation")}
          >
            Innovation
          </button>
          <button
            className={`ln-filter-btn ${filter === "sustainability" ? "active" : ""}`}
            onClick={() => setFilter("sustainability")}
          >
            Sustainability
          </button>
          <button
            className={`ln-filter-btn ${filter === "award" ? "active" : ""}`}
            onClick={() => setFilter("award")}
          >
            Awards
          </button>
        </div>

        <div className="ln-grid">
          {filteredNews.map((item) => (
            <div className="ln-card" key={item.id}>
              <div className="ln-card-image">{item.image}</div>
              <div className="ln-card-content">
                <span className="ln-card-category">{item.category.replace("-", " ")}</span>
                <div className="ln-card-date">{item.date}</div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <a href="#" className="ln-read-more">
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "#999" }}>
            <p>No news found in this category.</p>
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section className="ln-section">
        <div style={{
          background: "linear-gradient(135deg, #2c1f13 0%, #5c3d2a 100%)",
          color: "white",
          padding: "48px",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: "700", marginBottom: "12px" }}>
            Stay in the Loop
          </h2>
          <p style={{ marginBottom: "24px", opacity: 0.9 }}>
            Subscribe to our newsletter for the latest SAWO news, product launches, and wellness tips.
          </p>
          <div style={{ display: "flex", gap: "12px", maxWidth: "400px", margin: "0 auto" }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <button
              style={{
                padding: "12px 24px",
                background: "#a67853",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => e.target.style.background = "#8b5e3c"}
              onMouseLeave={(e) => e.target.style.background = "#a67853"}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ln-section" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2c1f13", marginBottom: "24px" }}>
          Explore Our Products
        </h2>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px" }}>
          Discover the sauna solutions featured in our latest news and innovations.
        </p>
        <ButtonClear text="BROWSE PRODUCTS" href="https://www.sawo.com/sawo-products/" />
      </section>
    </div>
  );
};

export default LatestNews;
