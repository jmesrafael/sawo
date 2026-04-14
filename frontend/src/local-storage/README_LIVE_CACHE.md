# Live Cache Architecture

## Overview
This system separates data sources for the Admin CMS and Frontend:

- **Admin CMS** (`Products.jsx`) → Uses **live Supabase data** (via `supabaseReader.js`)
- **Frontend** → Uses **local cache** (via `cacheReader.js`)

## Why This Approach?

### Admin CMS (Live Supabase)
- Real-time data reflecting current state
- Instant updates when you save/edit products
- Always see the source of truth
- No refresh needed

### Frontend (Local Cache)
- Cached data for optimal performance
- Users can control when to update via "Update Local" button
- No unnecessary network calls on every page load
- Better for mobile/slow connections

## Data Flow

```
1. Edit product in Admin CMS
   ↓
2. Save to Supabase
   ↓
3. Admin displays updated data (live from Supabase)
   ↓
4. User clicks "Update Local" button
   ↓
5. Local cache syncs with Supabase
   ↓
6. Frontend reflects changes on next load
```

## Files

### `supabaseReader.js` (NEW)
Fetches **live data from Supabase** for Admin CMS:
- `getAllProductsLive()` - fetch all products
- `getAllCategoriesLive()` - fetch all categories
- `getAllTagsLive()` - fetch all tags
- `getProductByIdLive(id)` - fetch single product
- `getProductBySlugLive(slug)` - fetch by slug

### `cacheReader.js` (UNCHANGED)
Reads **local JSON files** for Frontend:
- `getAllProducts()` - read from local cache
- `getAllCategories()` - read from local cache
- `getAllTags()` - read from local cache
- `getProductById(id)` - read from local cache

### `Products.jsx` (UPDATED)
Admin CMS now uses:
- `getAllProductsLive()` instead of `getAllProducts()`
- `getAllCategoriesLive()` instead of `getAllCategories()`
- `getAllTagsLive()` instead of `getAllTags()`
- `getProductByIdLive()` instead of `getProductById()`

All calls are now `async/await` for real-time updates.

## Usage Examples

### In Admin CMS
```jsx
// Products.jsx
import { getAllProductsLive } from '../local-storage/supabaseReader';

const fetchProducts = async () => {
  const data = await getAllProductsLive();
  setProducts(data);
};
```

### In Frontend
```jsx
// ProductPage.jsx
import { getProductBySlug } from '../local-storage/cacheReader';

const product = getProductBySlug(slug);
```

## Update Local Button
The "Update Local" button in the Admin toolbar:
1. Calls `devServer.js` to sync local cache
2. Fetches latest Supabase data
3. Updates local JSON files
4. Frontend will use updated cache on next refresh

When to use:
- After creating a new product
- After editing product details
- After deleting products
- Anytime you want frontend to reflect CMS changes

## Benefits
✅ Admin sees real-time data  
✅ Frontend stays fast with cache  
✅ Explicit control over when frontend updates  
✅ Works offline (frontend uses cache)  
✅ No performance impact on frontend  
✅ Clear separation of concerns
