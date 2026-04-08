// SaunaRooms.jsx

import React from "react";
import ButtonClear from "../../components/Buttons/ButtonClear";
import saunaRoomsHero from "../../assets/Sauna/Sauna Rooms/1620ML_scene1.webp";

const SaunaRooms = () => {
  return (
    <div className="relative">

      {/* ===================== */}
      {/* HERO SECTION          */}
      {/* ===================== */}
      <section
        className="sr-hero min-h-[95vh] flex flex-col justify-center items-center text-center px-6 relative"
        style={{
          backgroundImage: `url(${saunaRoomsHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="sr-hero-overlay" />
        <div className="sr-hero-content">
          <h1 className="sr-hero-title">SAUNA ROOMS</h1>
          <div style={{ marginTop: "32px" }}>
            <ButtonClear
              text="VIEW CATALOGUE"
              href="https://heyzine.com/flip-book/524075b3c1.html"
            />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* STYLES                */}
      {/* ===================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');

        /* ---- Hero ---- */
        .sr-hero-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.48); z-index: 0;
        }
        .sr-hero-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        .sr-hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 45px; line-height: 52px;
          font-weight: 700; color: #fff; margin: 0;
        }

        @media (max-width: 640px) {
          .sr-hero-title { font-size: 28px; line-height: 36px; }
        }
      `}</style>

    </div>
  );
};

export default SaunaRooms;
