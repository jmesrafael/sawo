// src/admin/GalleryPage.jsx
import React, { useEffect, useState } from "react";
import { apiGetGallery, apiDeleteGallery, apiUploadImage } from "../lib/api";
import { Toast, useToast, PageShell, Btn, Confirm, ImageUploader, EmptyState, Card, C } from "./ui";

const F = "'Inter', 'Montserrat', system-ui, sans-serif";

export default function GalleryPage() {
  const { toasts, add, remove } = useToast();
  const [images, setImages]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [copied, setCopied]     = useState(null);
  const [search, setSearch]     = useState("");

  const load = async () => {
    try { setImages(await apiGetGallery()); }
    catch (err) { add(err.message, "error"); }
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await apiUploadImage(file);
      add("Image uploaded.", "success");
      load();
    } catch (err) { add(err.message, "error"); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try { await apiDeleteGallery(confirmDel.id); add("Image deleted.", "success"); }
    catch (err) { add(err.message, "error"); }
    finally { setConfirmDel(null); load(); }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = images.filter(img =>
    !search || img.original_name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtSize = (bytes) => bytes ? `${(bytes / 1024).toFixed(0)} KB` : "";

  return (
    <PageShell
      title="Gallery"
      subtitle={`${images.length} image${images.length !== 1 ? "s" : ""} uploaded`}
      toolbar={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", maxWidth: 260 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.textLight, fontSize: "0.78rem" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by filename…"
              style={{ padding: "7px 10px 7px 28px", borderRadius: 6, border: `1.5px solid ${C.border}`, fontFamily: F, fontSize: "0.82rem", background: "#fff", width: 220 }} />
          </div>
        </div>
      }
    >
      <Toast toasts={toasts} remove={remove} />

      {/* Upload zone */}
      <Card style={{ marginBottom: 16, padding: 14 }}>
        <p style={{ fontFamily: F, fontSize: "0.75rem", fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Upload New Image</p>
        <ImageUploader onUpload={handleUpload} label="Click or drag an image to upload" uploading={uploading} />
      </Card>

      {/* Gallery grid */}
      {filtered.length === 0
        ? <EmptyState icon="fa-images" title="No images yet" message="Upload your first image above." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {filtered.map(img => (
              <div key={img.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                {/* Image */}
                <div style={{ height: 120, background: C.bg, overflow: "hidden" }}>
                  <img src={img.url} alt={img.original_name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                {/* Info */}
                <div style={{ padding: "8px 9px" }}>
                  <p style={{ fontFamily: F, fontSize: "0.72rem", fontWeight: 500, color: C.text, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={img.original_name}>
                    {img.original_name || "image"}
                  </p>
                  <p style={{ fontFamily: F, fontSize: "0.65rem", color: C.textLight, margin: "0 0 7px" }}>
                    {fmtSize(img.size)}{img.uploaded_by && ` · @${img.uploaded_by}`}
                  </p>

                  {/* URL field */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    <input readOnly value={img.url}
                      style={{ flex: 1, padding: "4px 6px", fontSize: "0.65rem", border: `1px solid ${C.border}`, borderRadius: 4, background: C.bg, fontFamily: "monospace", color: C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
                      onClick={e => e.target.select()} />
                    <button type="button" onClick={() => copyUrl(img.url, img.id)}
                      title="Copy URL"
                      style={{ padding: "4px 7px", background: copied === img.id ? C.success : C.bg, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", color: copied === img.id ? "#fff" : C.textLight, fontSize: "0.7rem", flexShrink: 0, transition: "all 0.2s" }}>
                      <i className={`fa-solid ${copied === img.id ? "fa-check" : "fa-copy"}`} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button type="button" onClick={() => setConfirmDel(img)}
                    style={{ width: "100%", padding: "4px", background: "none", border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", color: C.danger, fontFamily: F, fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <i className="fa-solid fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Confirm
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Delete Image?"
        message={`Delete "${confirmDel?.original_name}"? It will also be removed from Supabase Storage.`}
        confirmLabel="Delete"
      />
    </PageShell>
  );
}
