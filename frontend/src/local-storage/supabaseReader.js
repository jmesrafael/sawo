/**
 * supabaseReader.js
 * src/local-storage/supabaseReader.js
 *
 * Fetches live data from Supabase for the Administrator CMS.
 * Used only in the admin panel to show real-time data.
 * The frontend continues to use cacheReader.js (local cache).
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *  import { getAllProductsLive, getAllCategoriesLive, getAllTagsLive } from '../local-storage/supabaseReader';
 *
 *  // In admin CMS:
 *  const products = await getAllProductsLive();
 *
 *  // In frontend:
 *  import { getAllProducts } from '../local-storage/cacheReader';
 *  const products = getAllProducts();
 */

import { supabase } from "../Administrator/supabase";

/**
 * Fetch all products live from Supabase
 */
export async function getAllProductsLive() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch products:", err);
    return [];
  }
}

/**
 * Fetch all categories live from Supabase
 */
export async function getAllCategoriesLive() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch categories:", err);
    return [];
  }
}

/**
 * Fetch all tags live from Supabase
 */
export async function getAllTagsLive() {
  try {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch tags:", err);
    return [];
  }
}

/**
 * Fetch a single product by ID live from Supabase
 */
export async function getProductByIdLive(id) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch product:", err);
    return null;
  }
}

/**
 * Fetch a single product by slug live from Supabase
 */
export async function getProductBySlugLive(slug) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch product by slug:", err);
    return null;
  }
}

/**
 * Get visible (published & visible) products live from Supabase
 */
export async function getVisibleProductsLive() {
  try {
    const products = await getAllProductsLive();
    return products.filter(p =>
      p.visible !== false && p.status === 'published'
    );
  } catch (err) {
    console.error("[supabaseReader] Failed to fetch visible products:", err);
    return [];
  }
}

/**
 * Search products live from Supabase
 */
export async function searchProductsLive(query) {
  try {
    const products = await getAllProductsLive();
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.short_description?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  } catch (err) {
    console.error("[supabaseReader] Failed to search products:", err);
    return [];
  }
}
