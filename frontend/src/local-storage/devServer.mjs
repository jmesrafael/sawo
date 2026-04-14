/**
 * devServer.js
 * src/local-cache/devServer.js
 *
 * Tiny Express server that lets the CMS "Update Local" button
 * trigger the Node sync script directly from the browser.
 *
 * ─── RUN (in a separate terminal alongside npm start) ─────────────────────────
 *   node src/local-cache/devServer.js
 *
 * ─── INSTALL ONCE ─────────────────────────────────────────────────────────────
 *   npm install express cors
 *
 * ─── ENDPOINTS ────────────────────────────────────────────────────────────────
 *   POST /api/cache/sync   → delta sync (only changed products)
 *   POST /api/cache/full   → full re-download of everything
 *   GET  /api/cache/status → returns sync_meta.json
 */

import express    from 'express';
import cors       from 'cors';
import { execFile } from 'child_process';
import path       from 'path';
import fs         from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app    = express();
const PORT   = 3001;
const SCRIPT = path.join(__dirname, 'fetchProducts.mjs');
const META   = path.join(__dirname, 'data/sync_meta.json');
const FILES  = path.join(__dirname, 'files');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ─── Serve cached images and PDFs ────────────────────────────────────────────
app.use('/local-storage/files', express.static(FILES));

// ─── Helper: run fetchProducts.js with optional args ─────────────────────────
function runScript(args = []) {
  return new Promise((resolve, reject) => {
    execFile('node', [SCRIPT, ...args], { timeout: 5 * 60 * 1000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout);
    });
  });
}

// ─── Parse result summary from script stdout ─────────────────────────────────
function parseResult(stdout) {
  return {
    added:   parseInt(stdout.match(/\+(\d+) added/)?.[1]   || '0'),
    updated: parseInt(stdout.match(/~(\d+) updated/)?.[1]  || '0'),
    deleted: parseInt(stdout.match(/✗(\d+) deleted/)?.[1]  || '0'),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Smart delta sync
app.post('/api/cache/sync', async (req, res) => {
  console.log('\n[devServer] 🔄 Delta sync triggered from CMS...');
  try {
    const stdout = await runScript();
    console.log(stdout);
    const result = parseResult(stdout);
    const meta   = await fs.readJson(META).catch(() => null);
    res.json({ ...result, meta });
  } catch (err) {
    console.error('[devServer] ❌', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Full re-download
app.post('/api/cache/full', async (req, res) => {
  console.log('\n[devServer] 🚀 Full download triggered from CMS...');
  try {
    const stdout = await runScript(['--full']);
    console.log(stdout);
    const meta   = await fs.readJson(META).catch(() => null);
    res.json({ added: meta?.product_count || 0, updated: 0, deleted: 0, full: true, meta });
  } catch (err) {
    console.error('[devServer] ❌', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Status check — returns current sync_meta.json
app.get('/api/cache/status', async (req, res) => {
  try {
    const meta = await fs.readJson(META);
    res.json(meta);
  } catch {
    res.status(404).json({ error: 'Cache not yet created. Run: node src/local-cache/fetchProducts.js' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Cache dev server running on http://localhost:${PORT}`);
  console.log('   POST /api/cache/sync   — delta sync');
  console.log('   POST /api/cache/full   — full re-download');
  console.log('   GET  /api/cache/status — sync metadata\n');
});
