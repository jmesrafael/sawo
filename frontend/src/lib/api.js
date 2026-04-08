// src/lib/api.js — v5
const BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
export const getToken = () => localStorage.getItem("sawo_token");

async function req(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

// Auth
export const apiLogin          = (u, p)  => req("POST", "/api/auth/login", { username: u, password: p });
export const apiMe             = ()      => req("GET",  "/api/auth/me");
export const apiForgotPassword = (email) => req("POST", "/api/auth/forgot-password", { email });
export const apiResetPassword  = (t, p)  => req("POST", "/api/auth/reset-password", { token: t, password: p });
export const apiSetDarkMode    = (dark_mode) => req("PUT", "/api/auth/dark-mode", { dark_mode });

// Users
export const apiGetUsers   = ()       => req("GET",    "/api/users");
export const apiCreateUser = (b)      => req("POST",   "/api/users", b);
export const apiUpdateUser = (id, b)  => req("PUT",    `/api/users/${id}`, b);
export const apiDeleteUser = (id)     => req("DELETE", `/api/users/${id}`);

// Products (admin)
export const apiGetProducts      = (params = {}) => req("GET", `/api/products${toQS(params)}`);
export const apiGetProduct       = (id)    => req("GET",    `/api/products/${id}`);
export const apiCreateProduct    = (b)     => req("POST",   "/api/products", b);
export const apiUpdateProduct    = (id, b) => req("PUT",    `/api/products/${id}`, b);
export const apiDeleteProduct    = (id)    => req("DELETE", `/api/products/${id}`);
export const apiDuplicateProduct = (id)    => req("POST",   `/api/products/${id}/duplicate`);
export const apiBulkProducts     = (ids, action) => req("POST", "/api/products/bulk", { ids, action });

// Public
export const apiPublicProducts = (params = {}) =>
  fetch(`${BASE}/api/public/products${toQS(params)}`).then(r => r.json());
export const apiPublicProduct = (slug) =>
  fetch(`${BASE}/api/public/products/${slug}`).then(r => r.json());
export const apiGetSnapshot = () =>
  fetch(`${BASE}/api/snapshot`).then(r => r.json());
export const apiRebuildSnapshot = () => req("POST", "/api/snapshot/rebuild");

// Categories
export const apiGetCategories  = () => fetch(`${BASE}/api/categories`).then(r => r.json());
export const apiCreateCategory = (b)      => req("POST",   "/api/categories", b);
export const apiUpdateCategory = (id, b)  => req("PUT",    `/api/categories/${id}`, b);
export const apiDeleteCategory = (id)     => req("DELETE", `/api/categories/${id}`);

// Tags
export const apiGetTags   = () => fetch(`${BASE}/api/tags`).then(r => r.json());
export const apiCreateTag = (b)  => req("POST",   "/api/tags", b);
export const apiDeleteTag = (id) => req("DELETE", `/api/tags/${id}`);

// Product Layout
export const apiGetProductLayout  = () => fetch(`${BASE}/api/product-layout`).then(r => r.json());
export const apiSaveProductLayout = (b) => req("PUT", "/api/product-layout", b);

// Upload
export async function apiUploadImage(file) {
  const fd = new FormData(); fd.append("file", file);
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data;
}
export async function apiUploadImages(files) {
  const fd = new FormData(); files.forEach(f => fd.append("files", f));
  const res = await fetch(`${BASE}/api/upload/multi`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data;
}

// Session
export const saveSession  = (t, u) => { localStorage.setItem("sawo_token", t); localStorage.setItem("sawo_user", JSON.stringify(u)); };
export const getSession   = ()     => { const t = getToken(), u = localStorage.getItem("sawo_user"); return t && u ? { token: t, user: JSON.parse(u) } : null; };
export const clearSession = ()     => { localStorage.removeItem("sawo_token"); localStorage.removeItem("sawo_user"); };
export const updateSessionUser = (updates) => {
  const session = getSession();
  if (!session) return;
  const updated = { ...session.user, ...updates };
  localStorage.setItem("sawo_user", JSON.stringify(updated));
};

// Cache
const CACHE_KEY = "sawo_products_cache";
const CACHE_TS  = "sawo_products_cache_ts";
export const getCachedProducts  = () => { try { const d = localStorage.getItem(CACHE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };
export const setCachedProducts  = (d) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); localStorage.setItem(CACHE_TS, Date.now().toString()); } catch {} };
export const getCacheTimestamp  = () => parseInt(localStorage.getItem(CACHE_TS) || "0");

function toQS(p) { const s = new URLSearchParams(p).toString(); return s ? `?${s}` : ""; }
