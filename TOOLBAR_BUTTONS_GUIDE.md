# Products Toolbar - Button Guide

## 📋 Overview

The Products toolbar has several utility buttons that help you manage your product database and cache. Here's a detailed guide to each button.

---

## 🔄 Update Local Cache Buttons

Located in the toolbar next to the Storage button. These control how the frontend cache is synchronized with Supabase.

### 1️⃣ Update Local (Rotate Icon)
**Tooltip:** "Update Local Cache — Syncs only changed products. Fast and efficient. Use this after editing or creating products."

#### What It Does
- Compares Supabase with local cache
- Only syncs products that have changed
- Adds new products
- Removes deleted products
- Updates modified products
- Fast and efficient

#### When to Use
- ✅ After editing a product
- ✅ After creating a new product
- ✅ After deleting a product
- ✅ After changing categories/tags
- ✅ Regular sync (most common)

#### What Happens
```
Click "Update Local"
    ↓
devServer compares Supabase vs Local
    ↓
Downloads only changed data
    ↓
Updates local JSON files
    ↓
Notification: "Cache synced. Products refreshed."
    ↓
Frontend users see changes on next refresh
```

#### Speed
⚡ **Fast** - Only syncs changes, not entire database

---

### 2️⃣ Full Refresh (Download Icon)
**Tooltip:** "Full Refresh Cache — Deletes all cached data and re-downloads everything from Supabase. Use this if cache seems outdated or corrupted."

#### What It Does
- Wipes entire local cache (all JSON files)
- Re-downloads ALL products, categories, tags
- Forces complete resync
- Helpful for fixing stale data

#### When to Use
- ✅ Cache seems outdated or wrong
- ✅ Suspecting data corruption
- ✅ After major bulk operations
- ✅ Troubleshooting cache issues
- ✅ Before important deployments

#### What Happens
```
Click Full Refresh
    ↓
Delete all local cache files
    ↓
Fetch all data fresh from Supabase
    ↓
Rebuild all JSON files from scratch
    ↓
Notification: "Full download complete"
    ↓
Frontend gets completely fresh data
```

#### Speed
⏱️ **Slower** - Downloads entire database

#### When NOT to Use
- ❌ After single product edit (use Update Local)
- ❌ When in a hurry (takes longer)
- ❌ Multiple times per day (unnecessary)

---

## 🧹 Storage Cleanup Button

**Tooltip:** "Storage Cleanup — Remove orphaned files. Scans both image and PDF storage buckets to find and delete files that aren't attached to any product. Safe to run anytime."

### What It Does
- Scans image storage bucket (`product-images`)
- Scans PDF storage bucket (`product-pdf`)
- Finds files NOT attached to any product
- Deletes orphaned files
- Frees up storage space

### When to Use
- ✅ After deleting products (removes their old images/PDFs)
- ✅ After removing images from products
- ✅ Regularly (monthly is good)
- ✅ Before checking storage costs
- ✅ When storage space is limited

### What Gets Deleted
Files that:
- Are in storage buckets
- Are NOT referenced by any product's thumbnail, images, spec_images, or files fields
- Were left behind from deleted products
- Were uploaded but never used

### What's Safe
- ✅ All products stay intact
- ✅ All categories/tags untouched
- ✅ Product data never modified
- ✅ Only removes unused files

### How It Works

#### Dry Run (Preview)
1. Shows what WOULD be deleted
2. Nothing actually gets removed
3. Safe to preview
4. Always run this first

#### Actual Cleanup
1. Uncheck "Dry Run"
2. Click "Delete Orphaned Files"
3. Files are permanently deleted
4. Storage space is freed

### Example Scenario

**Before cleanup:**
- Product A (deleted) had 5 images
- Those 5 images still in storage
- Storage: 500 MB used

**After cleanup:**
- 5 orphaned images removed
- Storage: 450 MB used
- Saved 50 MB

---

## 🚀 Quick Reference

| Button | Icon | Purpose | Speed | Use Case |
|--------|------|---------|-------|----------|
| **Update Local** | ↻ | Sync changed data | Fast ⚡ | After edits |
| **Full Refresh** | ⬇️ | Re-download all | Slow ⏱️ | Fix corruption |
| **Storage Cleanup** | 🧹 | Remove orphaned files | Variable | Maintenance |

---

## 💡 Best Practices

### Daily Usage
1. Edit/create products in Admin
2. Click **Update Local** ↻
3. Wait for "Cache synced" notification
4. Users see changes on refresh

### Weekly
1. Check if storage is growing
2. Consider running **Storage Cleanup**
3. Preview with Dry Run first
4. Only delete if confident

### Monthly
1. Run **Storage Cleanup** if needed
2. Consider **Full Refresh** for peace of mind
3. Check storage space saved

### Before Deployments
1. Run **Update Local** ↻ to ensure frontend is current
2. Consider **Full Refresh** for clean slate
3. Test frontend pages load correctly

---

## ⚠️ Important Notes

### Update Local vs Full Refresh

**Use Update Local (↻) when:**
- Making routine edits
- Need fast sync
- Confident cache is good
- Normal daily operations

**Use Full Refresh (⬇️) when:**
- Cache seems wrong/outdated
- After major bulk operations
- Troubleshooting issues
- Before critical deployments

### Storage Cleanup

**Safe to run:**
- Any time (preview with Dry Run first)
- Multiple times
- Won't affect products

**Not recommended:**
- Never deletes product data
- Never deletes active images
- Only removes orphaned files
- Completely reversible (if you have backup)

---

## 🆘 Troubleshooting

**Product edits not showing on frontend?**
→ Click "Update Local" ↻

**Frontend showing old data?**
→ Click "Full Refresh" ⬇️ then refresh page

**Unsure about deleting orphaned files?**
→ Use "Dry Run" first to preview

**Storage keeps growing?**
→ Run "Storage Cleanup" 🧹 monthly

---

## 📊 Keyboard Access

All buttons are accessible via:
- **Mouse hover** - Shows tooltip
- **Mouse click** - Triggers action
- **Keyboard Tab** - Navigate buttons
- **Keyboard Enter/Space** - Activate button

---

## 🎯 Summary

- **↻ Update Local** = Quick sync of changes (use after edits)
- **⬇️ Full Refresh** = Complete resync from scratch (use for troubleshooting)
- **🧹 Storage Cleanup** = Remove unused files (use monthly)

All buttons have detailed tooltips. Hover over any button to see what it does!
