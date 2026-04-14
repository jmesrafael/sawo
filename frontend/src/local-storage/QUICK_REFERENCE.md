# Quick Reference - Admin Live Data

## 🚀 TL;DR

- **Admin CMS** → Uses **supabaseReader.js** → Fetches from **Supabase live** (real-time ✨)
- **Frontend** → Uses **cacheReader.js** → Reads **local JSON cache** (fast 🚀)
- **Update Local Button** → Syncs cache from Supabase to local files

---

## 📋 When to Use Which

### In Admin Pages (Products.jsx, Taxonomy.jsx, Models.jsx)
```javascript
import { getAllProductsLive } from '../local-storage/supabaseReader';

const data = await getAllProductsLive();  // ← Real-time from Supabase
```

### In Frontend Pages (ProductPage.jsx, Viewer.jsx, etc.)
```javascript
import { getAllProducts } from '../local-storage/cacheReader';

const data = getAllProducts();  // ← Fast, from local cache
```

---

## 🔧 Available Functions

### Live Functions (Admin Only) - **supabaseReader.js**
```javascript
await getAllProductsLive()           // Get all products
await getAllCategoriesLive()         // Get all categories
await getAllTagsLive()               // Get all tags
await getProductByIdLive(id)         // Get product by ID
await getProductBySlugLive(slug)     // Get product by slug
```

### Cache Functions (Frontend) - **cacheReader.js**
```javascript
getAllProducts()                     // Get all products (cached)
getAllCategories()                   // Get all categories (cached)
getAllTags()                         // Get all tags (cached)
getProductById(id)                   // Get product by ID (cached)
getProductBySlug(slug)               // Get product by slug (cached)
getCacheMeta()                       // Get cache metadata
```

---

## 📊 Files Overview

| File | Purpose | Used By |
|------|---------|---------|
| **supabaseReader.js** | Fetch live from Supabase | Admin CMS only |
| **cacheReader.js** | Read local JSON cache | Frontend only |
| **Products.jsx** | Admin product manager | Admins |
| **Taxonomy.jsx** | Manage categories/tags | Admins |
| **Models.jsx** | View products by type | Admins |
| **devServer.js** | Sync Supabase → Local cache | Backend sync |

---

## 🔄 Update Flow

```
1. Admin edits product
   ↓
2. Save to Supabase ✅
   ↓
3. Admin sees live update ✨ (supabaseReader)
   ↓
4. User clicks "Update Local" button 🔄
   ↓
5. devServer fetches from Supabase
   ↓
6. Updates local JSON files
   ↓
7. Frontend loads new cache 🚀
```

---

## ✅ Verification Checklist

- [ ] Admin Products page shows live data
- [ ] Editing product updates immediately
- [ ] Taxonomy categories show correct counts
- [ ] Models page displays all products
- [ ] "Update Local" button works
- [ ] Frontend still loads fast
- [ ] Products page uses local cache

---

## 🆘 Troubleshooting

**Admin shows old data?**
- Check that you're importing from `supabaseReader.js` (not `cacheReader.js`)
- Verify Supabase connection is working

**Frontend shows old data?**
- Click "Update Local" button to sync cache
- Hard refresh browser (Ctrl+Shift+R)
- Check that local JSON files were updated

**"Update Local" button disabled?**
- devServer.js must be running in separate terminal
- Run: `node src/local-storage/devServer.js`

---

## 📚 More Info

See [LIVE_ADMIN_ARCHITECTURE.md](../../LIVE_ADMIN_ARCHITECTURE.md) for detailed architecture docs.
