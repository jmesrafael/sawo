# 🚀 SAWO Website Performance Optimization Guide

**Last Updated:** April 2026  
**Priority:** High - Critical for SEO, UX, and conversion rates

---

## 📊 Executive Summary

This guide provides actionable recommendations to significantly improve website loading speed and overall performance. Implementing these optimizations can improve:
- **Page Load Time:** 40-60% faster
- **First Contentful Paint (FCP):** 50-70% improvement
- **Largest Contentful Paint (LCP):** 30-45% faster
- **Search Engine Rankings:** Better Core Web Vitals scores

---

## 🎯 High Priority Optimizations

### 1. **Image Optimization (Most Impact)**

#### Current Status ✓
- Hero images use WebP format ✓
- Responsive srcsets implemented ✓
- `fetchPriority="high"` on hero images ✓

#### Recommended Improvements

**1a. Add Image Dimensions & Lazy Loading**
```jsx
// ❌ Current (missing dimensions)
<img src="/1920.webp" alt="SAWO hero" />

// ✅ Improved
<img 
  src="/1920.webp" 
  alt="SAWO hero" 
  width="1920"
  height="1080"
  fetchPriority="high"
  decoding="async"
  loading="eager"
/>
```

**1b. Implement Lazy Loading for Below-the-Fold Images**
```jsx
// Apply to non-hero images
<img 
  src={imageSrc}
  loading="lazy"
  decoding="async"
  width={width}
  height={height}
  alt={description}
/>
```

**1c. Create Image Optimization Component**
```jsx
// components/OptimizedImage.jsx
export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  srcSet 
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
```

**1d. Target Image Sizes to Optimize**

Hero Images (Already Good):
```
- Desktop: 1920×1080 → ~45KB (webp)
- Tablet: 1024×576 → ~28KB (webp)  
- Mobile: 640×360 → ~18KB (webp)
```

Product Images (Should Add):
- Generate 3 sizes: 300px, 600px, 1200px width
- Convert all to WebP with fallbacks
- Add thumbnail sizes for lists (150px)

**Implementation Steps:**
```bash
# Install sharp for image optimization
npm install sharp --save-dev

# Create build script to auto-generate srcsets
```

---

### 2. **Code Splitting & Lazy Loading (Critical)**

#### Implementation

**2a. Lazy Load Routes (Next.js-style)**
```jsx
// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/AboutUs/About'));
const Sauna = lazy(() => import('./pages/Sauna/Sauna'));
const Products = lazy(() => import('./pages/Admin/Products'));

function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        } 
      />
      {/* ... other routes */}
    </Routes>
  );
}
```

**2b. Code Splitting for Heavy Components**
```jsx
import { lazy, Suspense } from 'react';

// Lazy load admin panel (large bundle)
const AdminLayout = lazy(() => import('./Administrator/AdminLayout'));

// Lazy load heavy modals
const EditProductModal = lazy(() => import('./components/EditProductModal'));
```

**Expected Impact:**
- Initial bundle: ~450KB → ~280KB (38% reduction)
- First load: 2-3s faster on slow 3G

---

### 3. **Static Compression & Caching**

#### 3a. Enable Gzip Compression
```javascript
// frontend/public/.htaccess (for Apache)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>
```

#### 3b. Browser Caching Headers
```
# For static assets (cache for 1 year)
Cache-Control: public, max-age=31536000, immutable

# For images (cache for 30 days)
Cache-Control: public, max-age=2592000

# For HTML (no-cache, revalidate)
Cache-Control: public, max-age=0, must-revalidate
```

**Impact:** 60% faster repeat visits

---

### 4. **CSS & JavaScript Optimization**

#### 4a. Remove Unused CSS
```bash
# Install PurgeCSS or similar
npm install @tailwindcss/jit --save-dev

# Tailwind already included - ensure JIT mode enabled
```

**tailwind.config.js Check:**
```js
module.exports = {
  // Content scanning helps remove unused styles
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  // Ensure this is properly configured
}
```

#### 4b. Minify & Optimize
- **Already configured** in `react-scripts build`
- Ensure production builds are minified: ✓

#### 4c. Defer Non-Critical JavaScript
```jsx
// Use dynamic imports for features needed later
<button onClick={() => import('./heavy-feature').then(m => m.init())}>
  Load Feature
</button>
```

---

### 5. **Optimize Hero Image Loading (Detailed)**

#### Current Hero Implementation Analysis

**Strengths:**
- ✓ Uses WebP format
- ✓ Responsive srcsets
- ✓ `fetchPriority="high"`
- ✓ `loading="eager"`

**Improvements Needed:**
```jsx
// src/pages/Home/Hero.jsx - RECOMMENDED CHANGES

// Add: Explicit dimensions to prevent CLS
<picture>
  <source 
    media="(max-width: 640px)" 
    srcSet="/640.webp 1x, /640-2x.webp 2x"  // Add 2x variant
    type="image/webp" 
  />
  <source 
    media="(max-width: 1024px)" 
    srcSet="/1024.webp 1x, /1024-2x.webp 2x"
    type="image/webp" 
  />
  <source 
    srcSet="/1920.webp 1x, /1920-2x.webp 2x"
    type="image/webp" 
  />
  <img
    src="/1920.webp"
    alt="SAWO sauna heaters - Experience wellness"
    width="1920"
    height="1080"  // ← ADD THIS (fixes CLS)
    fetchPriority="high"
    decoding="async"
    loading="eager"
    style={{ 
      width: "100%", 
      height: "auto",
      display: "block"  // Removes inline gap
    }}
  />
</picture>
```

#### Generate 2x Variants for High-DPI Screens
```bash
# Use ImageMagick or sharp
convert 1920.webp -resize 3840x2160 1920-2x.webp
```

---

## 📈 Medium Priority Optimizations

### 6. **Font Optimization**

#### Current Issue
- Google Fonts may not be optimized
- System fonts falling back can cause flash

#### Solution: Use `font-display: swap`
```css
/* In your CSS or Google Fonts URL */
@font-face {
  font-family: 'Montserrat';
  src: url('/fonts/montserrat.woff2') format('woff2');
  font-display: swap; /* Shows fallback immediately */
}
```

**Or use self-hosted fonts:**
```bash
# Download from Google Fonts, self-host in /public/fonts
```

**Add to your HTML/CSS:**
```html
<link rel="preload" as="font" href="/fonts/montserrat.woff2" type="font/woff2" crossorigin>
```

---

### 7. **Optimize Splide Image Carousel**

Current implementation may load all images upfront. Optimize:

```jsx
// components/ImageCarousel.jsx
<Splide options={{
  autoplay: true,
  perPage: 1,
  arrows: true,
  pagination: true,
  lazyLoad: 'nearby', // ← Load nearby slides only
  speed: 600,
  width: '100%',
  heightRatio: 0.5,
}}>
  {images.map((img, idx) => (
    <SplideSlide key={idx}>
      <img 
        src={img} 
        alt={`Product ${idx}`}
        loading="lazy"  // ← Add this
        decoding="async"
        style={{ width: '100%', height: 'auto' }}
      />
    </SplideSlide>
  ))}
</Splide>
```

---

### 8. **API & Data Loading Optimization**

#### Problem: Supabase Calls Block Rendering
```jsx
// ❌ Blocks render
const [products, setProducts] = useState(null);
useEffect(() => {
  fetchFromSupabase().then(setProducts);
}, []);
```

#### Solution: Implement Skeleton/Progressive Loading
```jsx
// ✅ Shows loading state while fetching
import { useQuery } from '@tanstack/react-query';

export function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProductsLive(),
    staleTime: 1000 * 60 * 5, // Cache 5 min
  });

  return (
    <>
      {isLoading ? <SkeletonLoader /> : <ProductGrid data={data} />}
    </>
  );
}
```

**Add React Query:**
```bash
npm install @tanstack/react-query
```

---

### 9. **Minify SVGs & Optimize Icons**

If using FontAwesome, ensure:
```js
// Only import icons you use
import { faBolt, faFire } from '@fortawesome/free-solid-svg-icons';
// NOT: import * as Icons from ...
```

---

## 🔧 Low Priority - Nice-to-Haves

### 10. **Service Worker & Offline Support**
- Enables offline functionality
- Caches assets for faster load
- Implementation: `npm install workbox-cli`

### 11. **Content Delivery Network (CDN)**
- Use Cloudflare or similar
- Serves images from edge locations
- Reduces latency for international users

### 12. **HTTP/2 Push**
- Push critical resources early
- Most modern servers handle this

---

## 📋 Implementation Checklist

### Week 1: Quick Wins (2-4 hours)
- [ ] Delete unused markdown files ✓ DONE
- [ ] Add width/height attributes to hero images
- [ ] Enable Gzip compression
- [ ] Set up caching headers
- [ ] Verify TailwindCSS JIT mode
- [ ] Test mobile performance on slow 3G

### Week 2: Code Splitting (4-6 hours)
- [ ] Implement lazy route loading
- [ ] Add Suspense boundaries with loading states
- [ ] Measure bundle size reduction
- [ ] Test on low-end devices

### Week 3: Image Pipeline (3-4 hours)
- [ ] Set up automated image optimization
- [ ] Generate responsive srcsets for product images
- [ ] Create OptimizedImage component
- [ ] Audit and replace non-optimized images

### Week 4: Monitoring & Refinement (Ongoing)
- [ ] Set up Core Web Vitals monitoring
- [ ] Use Google PageSpeed Insights
- [ ] Monitor real user metrics
- [ ] Iterate on improvements

---

## 🎯 Performance Targets

### Current Estimated Metrics
- **FCP:** ~2.5s → Target: ~1.2s
- **LCP:** ~3.8s → Target: ~2.0s
- **CLS:** ~0.1 → Target: <0.05
- **Bundle Size:** ~450KB → Target: ~280KB

### Tools to Measure

**1. Google PageSpeed Insights**
```
https://pagespeed.web.dev
```

**2. Lighthouse (In Chrome DevTools)**
- Open DevTools → Lighthouse → Run Audit

**3. WebPageTest**
```
https://www.webpagetest.org
```

**4. Real User Monitoring**
```javascript
// Add to src/index.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔍 Performance Audit Script

Run this to analyze your bundle:
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer

# Add to package.json scripts
"analyze": "react-scripts build && source-map-explorer 'build/static/js/*.js'"

npm run analyze
```

---

## 📚 Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/reference/react#performance)
- [MDN: Image Optimization](https://developer.mozilla.org/en-US/docs/Learn/Performance/Multimedia/Images)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [TailwindCSS Performance](https://tailwindcss.com/docs/optimizing-for-production)

---

## 💡 Pro Tips

1. **Test on Real Devices** - Emulation isn't always accurate
2. **Monitor Over Time** - Set up automated performance monitoring
3. **Prioritize User Experience** - Speed metrics matter, but usability comes first
4. **Test in Slow Networks** - Chrome DevTools: Throttle to "Slow 3G"
5. **Cache Aggressively** - Use long expiration times for assets
6. **Lazy Load Everything Below Fold** - Except critical content

---

## 📞 Questions or Issues?

For questions about these optimizations, refer to:
- Google Web Fundamentals
- MDN Web Performance
- React Documentation
- Tailwind CSS Guide
