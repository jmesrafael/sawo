/**
 * UpdateLocalButton.jsx
 * src/local-cache/UpdateLocalButton.jsx
 *
 * CMS button to trigger local cache sync from the browser.
 * Requires devServer.js to be running in a separate terminal.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *  import UpdateLocalButton from '../../local-cache/UpdateLocalButton';
 *  <UpdateLocalButton onSyncComplete={callback} />
 *
 * ─── REQUIREMENTS ─────────────────────────────────────────────────────────────
 *  node src/local-cache/devServer.js   ← must be running in another terminal
 */

import { useState, useEffect } from 'react';

const DEV_SERVER = 'http://localhost:3001';

export default function UpdateLocalButton({ onSyncComplete } = {}) {
  const [status, setStatus] = useState('idle');   // idle | busy | done | error
  const [serverUp, setServerUp] = useState(null); // null=checking, true, false

  useEffect(() => {
    checkServer();
  }, []);

  async function checkServer() {
    try {
      const res = await fetch(`${DEV_SERVER}/api/cache/status`, { signal: AbortSignal.timeout(2000) });
      setServerUp(res.ok || res.status === 404);
    } catch {
      setServerUp(false);
    }
  }

  async function triggerSync(full = false) {
    setStatus('busy');
    try {
      const endpoint = full ? '/api/cache/full' : '/api/cache/sync';
      const res      = await fetch(`${DEV_SERVER}${endpoint}`, { method: 'POST' });
      const data     = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setStatus('done');
      onSyncComplete?.();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Cache sync failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const isBusy = status === 'busy';

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {/* Update Local — delta sync */}
      <button
        type="button"
        onClick={() => triggerSync(false)}
        disabled={isBusy || serverUp === false}
        title="Update Local Cache — Syncs only changed products. Fast and efficient. Use this after editing or creating products."
        className="icon-btn"
        style={{ opacity: isBusy ? 0.6 : 1 }}
      >
        <i className={`fa-solid ${isBusy ? 'fa-spinner' : 'fa-rotate'}`}
          style={{ animation: isBusy ? 'spin 1s linear infinite' : 'none', fontSize: '0.85em' }} />
      </button>

      {/* Full re-download */}
      <button
        type="button"
        onClick={() => triggerSync(true)}
        disabled={isBusy || serverUp === false}
        title="Full Refresh Cache — Deletes all cached data and re-downloads everything from Supabase. Use this if cache seems outdated or corrupted."
        className="icon-btn"
        style={{ opacity: isBusy ? 0.6 : 1 }}
      >
        <i className="fa-solid fa-download" style={{ fontSize: '0.85em' }} />
      </button>
    </div>
  );
}
