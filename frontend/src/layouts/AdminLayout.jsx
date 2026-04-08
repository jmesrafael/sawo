// src/layouts/AdminLayout.jsx
import React from "react";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen font-[Montserrat]">
      <main>{children}</main>
    </div>
  );
}