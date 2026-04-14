/**
 * cacheReader.js
 * src/local-cache/cacheReader.js
 *
 * Drop-in replacement for Supabase product queries.
 * Reads from local JSON files — zero network calls.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *  import { getAllProducts, getProductBySlug, getCacheMeta } from '../local-cache/cacheReader';
 *
 *  // Before (Supabase):
 *  const { data } = await supabase.from('products').select('*')
 *
 *  // After (local):
 *  const data = getAllProducts();
 *
 * NOTE: After running fetchProducts.js, restart your dev server once so
 * React picks up the new JSON files.
 */

// ─── Lazy loaders — only reads file once per session ─────────────────────────
let _products   = null;
let _categories = null;
let _tags       = null;
let _meta       = null;

function loadProducts() {
  if (!_products) {
    try {
      _products = require('./data/products.json');
    } catch {
      console.warn('[cacheReader] products.json not found. Run: node src/local-cache/fetchProducts.js');
      _products = {};
    }
  }
  return _products;
}

function loadCategories() {
  if (!_categories) {
    try {
      _categories = require('./data/categories.json');
    } catch {
      _categories = {};
    }
  }
  return _categories;
}

function loadTags() {
  if (!_tags) {
    try {
      _tags = require('./data/tags.json');
    } catch {
      _tags = {};
    }
  }
  return _tags;
}

function loadMeta() {
  if (!_meta) {
    try {
      _meta = require('./data/sync_meta.json');
    } catch {
      _meta = null;
    }
  }
  return _meta;
}

// ═════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═════════════════════════════════════════════════════════════════════════════

/** All products as an array, sorted by sort_order */
export function getAllProducts() {
  return Object.values(loadProducts())
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}

/** Single product by ID */
export function getProductById(id) {
  return loadProducts()[id] ?? null;
}

/** Single product by slug */
export function getProductBySlug(slug) {
  return getAllProducts().find(p => p.slug === slug) ?? null;
}

/** Products in a category (pass category ID or name) */
export function getProductsByCategory(categoryIdOrName) {
  return getAllProducts().filter(p =>
    Array.isArray(p.categories) && p.categories.includes(categoryIdOrName)
  );
}

/** Products with a specific tag (pass tag ID or name) */
export function getProductsByTag(tagIdOrName) {
  return getAllProducts().filter(p =>
    Array.isArray(p.tags) && p.tags.includes(tagIdOrName)
  );
}

/** Only visible + published products */
export function getVisibleProducts() {
  return getAllProducts().filter(p =>
    p.visible !== false && p.status === 'published'
  );
}

/** Featured products only */
export function getFeaturedProducts() {
  return getAllProducts().filter(p => p.featured === true);
}

/** Products by brand */
export function getProductsByBrand(brand) {
  return getAllProducts().filter(p =>
    p.brand?.toLowerCase() === brand.toLowerCase()
  );
}

/** Full-text search across name, short_description, brand */
export function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return getAllProducts();
  return getAllProducts().filter(p =>
    p.name?.toLowerCase().includes(q)             ||
    p.short_description?.toLowerCase().includes(q)||
    p.brand?.toLowerCase().includes(q)
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═════════════════════════════════════════════════════════════════════════════

export function getAllCategories() {
  return Object.values(loadCategories());
}

export function getCategoryById(id) {
  return loadCategories()[id] ?? null;
}

// ═════════════════════════════════════════════════════════════════════════════
// TAGS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllTags() {
  return Object.values(loadTags());
}

export function getTagById(id) {
  return loadTags()[id] ?? null;
}

// ═════════════════════════════════════════════════════════════════════════════
// CACHE META
// ═════════════════════════════════════════════════════════════════════════════

/** Raw sync metadata — { last_synced_at, product_count, ... } */
export function getCacheMeta() {
  return loadMeta();
}

/** true if cache JSONs exist and are ready */
export function isCacheReady() {
  try {
    require('./data/sync_meta.json');
    require('./data/products.json');
    return true;
  } catch {
    return false;
  }
}

/** Human-readable label: "2 hours ago", "Just now", etc. */
export function getLastSyncedLabel() {
  const meta = loadMeta();
  if (!meta?.last_synced_at) return 'Never synced';

  const diff  = Date.now() - new Date(meta.last_synced_at).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);

  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'Just now';
}
