/**
 * fetchProducts.js
 * src/local-cache/fetchProducts.js
 *
 * ─── HOW TO RUN ───────────────────────────────────────────────────────────────
 *  First time / full re-download:
 *    node src/local-cache/fetchProducts.js --full
 *
 *  Smart sync (only changed products):
 *    node src/local-cache/fetchProducts.js
 *
 * ─── WHAT IT DOES ─────────────────────────────────────────────────────────────
 *  - Connects to Supabase using your existing .env vars
 *  - Downloads all products, categories, and tags as local JSON
 *  - Downloads all images → src/local-cache/files/images/
 *  - Downloads all PDFs/files → src/local-cache/files/pdfs/
 *  - On subsequent runs, only fetches rows where updated_at > last_synced_at
 *  - Skips re-downloading files whose URLs haven't changed
 *
 * ─── INSTALL DEPS (once) ──────────────────────────────────────────────────────
 *  npm install dotenv @supabase/supabase-js fs-extra
 */

import fs       from 'fs-extra';
import path     from 'path';
import https    from 'https';
import http     from 'http';
import dotenv   from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);
const ROOT        = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(ROOT, '.env') });

const DIR = {
  data:   path.join(__dirname, 'data'),
  images: path.join(__dirname, 'files/images'),
  pdfs:   path.join(__dirname, 'files/pdfs'),
};

const FILE = {
  products:   path.join(DIR.data, 'products.json'),
  categories: path.join(DIR.data, 'categories.json'),
  tags:       path.join(DIR.data, 'tags.json'),
  meta:       path.join(DIR.data, 'sync_meta.json'),
};

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ─── Args ─────────────────────────────────────────────────────────────────────
const FORCE_FULL = process.argv.includes('--full');

// ═════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═════════════════════════════════════════════════════════════════════════════

/** Download a URL to disk. Skips if file exists and force=false. */
async function downloadFile(url, destDir, filename, force = false) {
  if (!url) return null;

  await fs.ensureDir(destDir);

  const ext      = path.extname(url.split('?')[0]) || '.bin';
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_') + ext;
  const fullPath = path.join(destDir, safeName);

  // Skip if already on disk
  if (!force && await fs.pathExists(fullPath)) return fullPath;

  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const out   = fs.createWriteStream(fullPath);

    proto.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        out.close();
        return downloadFile(res.headers.location, destDir, filename, force)
          .then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        out.close();
        fs.remove(fullPath).catch(() => {});
        return reject(new Error(`HTTP ${res.statusCode} — ${url}`));
      }
      res.pipe(out);
      out.on('finish', () => { out.close(); resolve(fullPath); });
    }).on('error', (err) => {
      fs.remove(fullPath).catch(() => {});
      reject(err);
    });
  });
}

/**
 * Convert absolute disk path → web-relative path
 * e.g. /home/.../src/local-cache/files/images/abc.webp
 *   →  /local-cache/files/images/abc.webp
 */
function toWebPath(fullPath) {
  if (!fullPath) return null;
  const rel = path.relative(path.join(__dirname, '..'), fullPath);
  return '/' + rel.replace(/\\/g, '/');
}

function isImageUrl(url = '') {
  return /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(url);
}

// ═════════════════════════════════════════════════════════════════════════════
// ASSET LOCALIZER — downloads all images/files for one product
// ═════════════════════════════════════════════════════════════════════════════

async function localizeProduct(product, force = false) {
  const p   = { ...product };
  const pid = product.id;

  // Helper: download one URL, route to images/ or pdfs/ automatically
  async function dl(url, name) {
    if (!url) return null;
    const dest = isImageUrl(url) ? DIR.images : DIR.pdfs;
    try {
      const fp = await downloadFile(url, dest, `${pid}_${name}`, force);
      return toWebPath(fp);
    } catch (err) {
      console.warn(`    ⚠ ${name}: ${err.message}`);
      return null;
    }
  }

  // ── thumbnail (single URL) ────────────────────────────────────────────────
  p.local_thumbnail = await dl(product.thumbnail, 'thumbnail');

  // ── images[] ─────────────────────────────────────────────────────────────
  if (product.images?.length) {
    p.local_images = await Promise.all(
      product.images.map((url, i) => dl(url, `image_${i}`))
    );
  }

  // ── spec_images[] ─────────────────────────────────────────────────────────
  if (product.spec_images?.length) {
    p.local_spec_images = await Promise.all(
      product.spec_images.map((url, i) => dl(url, `spec_${i}`))
    );
  }

  // ── files[] — shape: { name, url } or plain URL string ───────────────────
  if (product.files?.length) {
    p.local_files = await Promise.all(
      product.files.map(async (file, i) => {
        const url   = typeof file === 'string' ? file : file?.url;
        const label = typeof file === 'object' && file?.name ? file.name : `file_${i}`;
        const local = await dl(url, `file_${i}_${label}`);
        return { ...(typeof file === 'object' ? file : { url }), local_path: local };
      })
    );
  }

  // ── resources[] — same shape as files ────────────────────────────────────
  if (product.resources?.length) {
    p.local_resources = await Promise.all(
      product.resources.map(async (res, i) => {
        const url   = typeof res === 'string' ? res : res?.url;
        const label = typeof res === 'object' && res?.name ? res.name : `res_${i}`;
        const local = await dl(url, `res_${i}_${label}`);
        return { ...(typeof res === 'object' ? res : { url }), local_path: local };
      })
    );
  }

  return p;
}

// ═════════════════════════════════════════════════════════════════════════════
// FULL DOWNLOAD
// ═════════════════════════════════════════════════════════════════════════════

async function downloadAll() {
  console.log('\n🚀 FULL DOWNLOAD — fetching everything from Supabase...\n');
  const start = Date.now();

  // Ensure all dirs exist
  await Promise.all(Object.values(DIR).map(d => fs.ensureDir(d)));

  // ── Products ──────────────────────────────────────────────────────────────
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_deleted', false)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Supabase products error: ${error.message}`);
  console.log(`📦 ${products.length} products found. Downloading assets...\n`);

  const localized = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`  [${i + 1}/${products.length}] ${p.name}... `);
    localized.push(await localizeProduct(p, true));
    console.log('✓');
  }

  await fs.writeJson(FILE.products, Object.fromEntries(localized.map(p => [p.id, p])), { spaces: 2 });
  console.log(`\n✅ products.json — ${localized.length} products`);

  // ── Categories ────────────────────────────────────────────────────────────
  const { data: cats } = await supabase.from('categories').select('*').order('name');
  if (cats) {
    await fs.writeJson(FILE.categories, Object.fromEntries(cats.map(c => [c.id, c])), { spaces: 2 });
    console.log(`✅ categories.json — ${cats.length} categories`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  const { data: tags } = await supabase.from('tags').select('*').order('name');
  if (tags) {
    await fs.writeJson(FILE.tags, Object.fromEntries(tags.map(t => [t.id, t])), { spaces: 2 });
    console.log(`✅ tags.json — ${tags.length} tags`);
  }

  // ── Meta ──────────────────────────────────────────────────────────────────
  const meta = {
    last_synced_at:  new Date().toISOString(),
    product_count:   localized.length,
    category_count:  cats?.length  || 0,
    tag_count:       tags?.length  || 0,
  };
  await fs.writeJson(FILE.meta, meta, { spaces: 2 });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🏁 Done in ${elapsed}s`);
  console.log(`   JSONs  → src/local-cache/data/`);
  console.log(`   Images → src/local-cache/files/images/`);
  console.log(`   PDFs   → src/local-cache/files/pdfs/\n`);

  return meta;
}

// ═════════════════════════════════════════════════════════════════════════════
// DELTA SYNC — only what changed since last_synced_at
// ═════════════════════════════════════════════════════════════════════════════

async function syncUpdates() {
  console.log('\n🔄 DELTA SYNC — checking for changes...\n');
  const start = Date.now();

  // No cache yet → fall back to full download
  if (!await fs.pathExists(FILE.meta) || !await fs.pathExists(FILE.products)) {
    console.log('⚠  No existing cache found. Running full download...');
    return downloadAll();
  }

  const meta       = await fs.readJson(FILE.meta);
  const lastSynced = meta.last_synced_at;
  console.log(`📅 Last synced: ${lastSynced}\n`);

  // Fetch only rows changed since last sync
  const { data: changed, error } = await supabase
    .from('products')
    .select('*')
    .gt('updated_at', lastSynced);

  if (error) throw new Error(`Supabase error: ${error.message}`);

  if (!changed.length) {
    console.log('✅ Already up to date — nothing changed.\n');
    return { added: 0, updated: 0, deleted: 0 };
  }

  console.log(`Found ${changed.length} changed product(s):\n`);

  const localProducts = await fs.readJson(FILE.products);
  let added = 0, updated = 0, deleted = 0;

  for (const product of changed) {
    const existing = localProducts[product.id];

    if (product.is_deleted) {
      // ── DELETED ───────────────────────────────────────────────────────────
      delete localProducts[product.id];
      deleted++;
      console.log(`  ✗ Deleted:  ${product.name}`);

    } else {
      const isNew = !existing;

      // Check if any asset URLs actually changed (skip re-download if not)
      const assetsChanged = isNew
        || product.thumbnail                          !== existing?.thumbnail
        || JSON.stringify(product.images)             !== JSON.stringify(existing?.images)
        || JSON.stringify(product.spec_images)        !== JSON.stringify(existing?.spec_images)
        || JSON.stringify(product.files)              !== JSON.stringify(existing?.files)
        || JSON.stringify(product.resources)          !== JSON.stringify(existing?.resources);

      if (assetsChanged) {
        process.stdout.write(`  ${isNew ? '+' : '~'} ${isNew ? 'Added  ' : 'Updated'}: ${product.name}... `);
        localProducts[product.id] = await localizeProduct(product, false);
        console.log('✓');
      } else {
        // Only data changed (name, description, etc.) — keep existing local paths
        localProducts[product.id] = {
          ...product,
          local_thumbnail:   existing.local_thumbnail,
          local_images:      existing.local_images,
          local_spec_images: existing.local_spec_images,
          local_files:       existing.local_files,
          local_resources:   existing.local_resources,
        };
        console.log(`  ~ Updated (data only): ${product.name}`);
      }

      isNew ? added++ : updated++;
    }
  }

  // Save + update meta
  await fs.writeJson(FILE.products, localProducts, { spaces: 2 });

  meta.last_synced_at   = new Date().toISOString();
  meta.product_count    = Object.keys(localProducts).length;
  meta.last_sync_result = { added, updated, deleted };
  await fs.writeJson(FILE.meta, meta, { spaces: 2 });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Sync done in ${elapsed}s — +${added} added  ~${updated} updated  ✗${deleted} deleted\n`);

  return { added, updated, deleted, meta };
}

// ═════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  try {
    if (FORCE_FULL) {
      await downloadAll();
    } else {
      await syncUpdates();
    }
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
