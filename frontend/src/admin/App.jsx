// src/App.jsx — v5: adds /products/:slug and ThemeProvider
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./admin/ThemeContext";

// Layouts
import MainLayout  from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import menuPaths   from "./menuPaths";

// Public pages (unchanged)
import Home             from "./pages/Home/Home";
import Infrared         from "./pages/Infrared/Infrared";
import About            from "./pages/AboutUs/About";
import Sustainability   from "./pages/AboutUs/Sustainability";
import LatestNews       from "./pages/AboutUs/LatestNews";
import Careers          from "./pages/Careers/Careers";
import Contact          from "./pages/Contact/Contact";
import Sauna            from "./pages/Sauna/Sauna";
import SaunaHeaters     from "./pages/Sauna/SaunaHeaters";
import WallMounted      from "./pages/Sauna/heaters/WallMounted";
import Tower            from "./pages/Sauna/heaters/Tower";
import Stone            from "./pages/Sauna/heaters/Stone";
import Floor            from "./pages/Sauna/heaters/Floor";
import Combi            from "./pages/Sauna/heaters/Combi";
import Dragonfire       from "./pages/Sauna/heaters/Dragonfire";
import SaunaControls    from "./pages/Sauna/SaunaControls";
import SaunaAccessories from "./pages/Sauna/SaunaAccessories";
import SaunaRooms       from "./pages/Sauna/SaunaRooms";
import InteriorDesign   from "./pages/Sauna/rooms/InteriorDesign";
import WoodPanelAndTimbers from "./pages/Sauna/rooms/WoodPanelandTimbers";
import Steam            from "./pages/Steam/Steam";
import SteamGenerators  from "./pages/Steam/SteamGenerators";
import SteamControls    from "./pages/Steam/SteamControls";
import SteamAccessories from "./pages/Steam/SteamAccessories";
import Support          from "./pages/Support/Support";
import FAQ              from "./pages/Support/FAQ";
import UserManuals      from "./pages/Support/UserManuals";
import ProductCatalogue from "./pages/Support/ProductCatalogue";

// ← NEW: dynamic product page
import ProductPage from "./pages/ProductPage";

// Admin
import Login          from "./admin/Login";
import Dashboard      from "./admin/Dashboard";
import ProtectedRoute from "./admin/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>

          {/* ── Public ── */}
          <Route path="*" element={
            <MainLayout>
              <Routes>
                <Route path={menuPaths.home} element={<Home />} />
                <Route path={menuPaths.infrared} element={<Infrared />} />
                <Route path={menuPaths.about.parent} element={<About />} />
                <Route path={menuPaths.about.sustainability} element={<Sustainability />} />
                <Route path={menuPaths.about.news} element={<LatestNews />} />
                <Route path={menuPaths.sauna.parent} element={<Sauna />} />
                <Route path={menuPaths.steam.parent} element={<Steam />} />
                <Route path={menuPaths.support.parent} element={<Support />} />
                <Route path={menuPaths.careers} element={<Careers />} />
                <Route path={menuPaths.contact} element={<Contact />} />
                <Route path={menuPaths.sauna.heaters.parent} element={<SaunaHeaters />} />
                <Route path={menuPaths.sauna.heaters.wallMounted} element={<WallMounted />} />
                <Route path={menuPaths.sauna.heaters.tower} element={<Tower />} />
                <Route path={menuPaths.sauna.heaters.stone} element={<Stone />} />
                <Route path={menuPaths.sauna.heaters.floor} element={<Floor />} />
                <Route path={menuPaths.sauna.heaters.combi} element={<Combi />} />
                <Route path={menuPaths.sauna.heaters.dragonfire} element={<Dragonfire />} />
                <Route path={menuPaths.sauna.controls} element={<SaunaControls />} />
                <Route path={menuPaths.sauna.accessories} element={<SaunaAccessories />} />
                <Route path={menuPaths.sauna.rooms} element={<SaunaRooms />} />
                <Route path={menuPaths.sauna.interiorDesigns} element={<InteriorDesign />} />
                <Route path={menuPaths.sauna.woodPanels} element={<WoodPanelAndTimbers />} />
                <Route path={menuPaths.steam.generators} element={<SteamGenerators />} />
                <Route path={menuPaths.steam.controls} element={<SteamControls />} />
                <Route path={menuPaths.steam.accessories} element={<SteamAccessories />} />
                <Route path={menuPaths.support.faq} element={<FAQ />} />
                <Route path={menuPaths.support.manuals} element={<UserManuals />} />
                <Route path={menuPaths.support.catalogue} element={<ProductCatalogue />} />

                {/* ← NEW: individual product pages */}
                <Route path="/products/:slug" element={<ProductPage />} />
              </Routes>
            </MainLayout>
          } />

          {/* ── Shortcut ── */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* ── Admin ── */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="" element={<Navigate to="login" replace />} />
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </AdminLayout>
          } />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}
