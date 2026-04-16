// Contact.jsx

import React, { useState } from "react";
import ButtonClear from "../../components/Buttons/ButtonClear";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log. In production, send to backend
    console.log("Form submitted:", formData);
    alert("Thank you for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="relative">
      <style>{`
        .ct-hero {
          min-height: 95vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          background: linear-gradient(135deg, #2c1f13 0%, #5c3d2a 50%, #2c1f13 100%);
          color: white;
        }
        .ct-hero h1 { font-size: 48px; font-weight: 700; margin-bottom: 16px; font-family: 'Montserrat', sans-serif; }
        .ct-hero p { font-size: 18px; opacity: 0.9; margin-bottom: 32px; }
        .ct-section { padding: 64px 24px; max-width: 1200px; margin: 0 auto; }
        .ct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin: 48px 0; }
        .ct-contact-card { padding: 32px; background: #f9f7f5; border-radius: 8px; }
        .ct-contact-card h3 { font-size: 20px; font-weight: 600; color: #2c1f13; margin-bottom: 12px; }
        .ct-contact-card p { color: #666; margin-bottom: 8px; }
        .ct-contact-card a { color: #a67853; text-decoration: none; font-weight: 600; }
        .ct-contact-card a:hover { text-decoration: underline; }
        .ct-form { padding: 32px; background: white; border: 1px solid #e0d5c7; border-radius: 8px; }
        .ct-form h3 { font-size: 20px; font-weight: 600; color: #2c1f13; margin-bottom: 24px; }
        .ct-form-group { margin-bottom: 20px; }
        .ct-form label { display: block; font-size: 14px; font-weight: 600; color: #2c1f13; margin-bottom: 8px; }
        .ct-form input, .ct-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e0d5c7;
          border-radius: 4px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .ct-form input:focus, .ct-form textarea:focus { outline: none; border-color: #a67853; }
        .ct-form textarea { resize: vertical; min-height: 120px; }
        .ct-submit {
          width: 100%;
          padding: 12px;
          background: #a67853;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        .ct-submit:hover { background: #8b5e3c; }
        @media (max-width: 768px) {
          .ct-grid { grid-template-columns: 1fr; gap: 32px; }
          .ct-hero h1 { font-size: 32px; }
        }
      `}</style>

      {/* HERO */}
      <section className="ct-hero">
        <div>
          <h1>GET IN TOUCH</h1>
          <p>We'd love to hear from you. Reach out with any questions or inquiries.</p>
        </div>
      </section>

      {/* CONTACT INFO + FORM */}
      <section className="ct-section" style={{ backgroundColor: "#f9f7f5" }}>
        <div className="ct-grid">
          {/* Left: Contact Info */}
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2c1f13", marginBottom: "32px" }}>
              Contact Information
            </h2>

            <div className="ct-contact-card">
              <h3><i className="fas fa-map-marker-alt" style={{ marginRight: "12px", color: "#a67853" }} />Address</h3>
              <p>SAWO Corporation</p>
              <p>Finland</p>
              <a href="https://www.sawo.com" target="_blank" rel="noopener noreferrer">Visit Website</a>
            </div>

            <div className="ct-contact-card" style={{ marginTop: "20px" }}>
              <h3><i className="fas fa-envelope" style={{ marginRight: "12px", color: "#a67853" }} />Email</h3>
              <p>For product inquiries, technical support, and general questions</p>
              <a href="mailto:info@sawo.com">info@sawo.com</a>
            </div>

            <div className="ct-contact-card" style={{ marginTop: "20px" }}>
              <h3><i className="fas fa-phone" style={{ marginRight: "12px", color: "#a67853" }} />Phone</h3>
              <p>Call us during business hours</p>
              <a href="tel:+358123456789">+358 (0) 1 234 56789</a>
            </div>

            <div className="ct-contact-card" style={{ marginTop: "20px" }}>
              <h3><i className="fas fa-globe" style={{ marginRight: "12px", color: "#a67853" }} />Follow Us</h3>
              <p>Connect with SAWO on social media</p>
              <div style={{ marginTop: "12px" }}>
                <a href="https://www.sawo.com" target="_blank" rel="noopener noreferrer" style={{ marginRight: "16px" }}>
                  <i className="fab fa-facebook" style={{ fontSize: "20px" }} />
                </a>
                <a href="https://www.sawo.com" target="_blank" rel="noopener noreferrer" style={{ marginRight: "16px" }}>
                  <i className="fab fa-instagram" style={{ fontSize: "20px" }} />
                </a>
                <a href="https://www.sawo.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin" style={{ fontSize: "20px" }} />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="ct-form">
            <h3>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="ct-form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="ct-form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="ct-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+358 (0) 1 234 56789"
                />
              </div>

              <div className="ct-form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className="ct-form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more..."
                />
              </div>

              <button type="submit" className="ct-submit">
                <i className="fas fa-paper-plane" style={{ marginRight: "8px" }} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ct-section">
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2c1f13", textAlign: "center", marginBottom: "24px" }}>
          Questions About Our Products?
        </h2>
        <p style={{ textAlign: "center", fontSize: "16px", color: "#666", marginBottom: "32px" }}>
          Browse our product catalogues or speak with a specialist to find the perfect sauna solution.
        </p>
        <div style={{ textAlign: "center" }}>
          <ButtonClear text="VIEW PRODUCTS" href="https://www.sawo.com/sawo-products/" />
        </div>
      </section>
    </div>
  );
};

export default Contact;
