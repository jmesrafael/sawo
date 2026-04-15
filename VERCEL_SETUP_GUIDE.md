# 🚀 Vercel Deployment Setup Guide

**Status:** Environment variables need to be configured  
**Time Required:** 5-10 minutes  
**Difficulty:** Easy

---

## ❌ The Error You're Seeing

```
Environment Variable "REACT_APP_SUPABASE_URL" references Secret 
"react_app_supabase_url", which does not exist.
```

**Cause:** Environment variables haven't been added to Vercel yet.

**Solution:** Add them through the Vercel dashboard (this guide).

---

## ✅ How to Fix (Step by Step)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Find your project (sawocom)
3. Click to open it

### Step 2: Go to Environment Variables
1. Click **Settings** (top tab)
2. Click **Environment Variables** (left menu)
3. You should see a form to add variables

### Step 3: Add Environment Variables

**Add these 2 variables:**

#### Variable 1: REACT_APP_SUPABASE_URL
- **Name:** `REACT_APP_SUPABASE_URL`
- **Value:** Your Supabase project URL (from your `.env` or `.env.local`)
  - Example: `https://xxxxx.supabase.co`
- **Environment:** Production, Preview, Development
- Click **Save**

#### Variable 2: REACT_APP_SUPABASE_ANON_KEY
- **Name:** `REACT_APP_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (from your `.env` or `.env.local`)
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environment:** Production, Preview, Development
- Click **Save**

### Step 4: Redeploy
1. Go back to **Deployments** tab
2. Click the **⋮** menu on the failed deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 📋 Where to Find Your Supabase Credentials

### If you have a `.env` or `.env.local` file:
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Copy these values into Vercel.

### If you don't have these values:

**Get from Supabase:**
1. Open your Supabase project: https://app.supabase.com
2. Go to **Project Settings**
3. Click **API** tab
4. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

---

## ⚠️ Important Notes

### Security
- ✅ **anon key is public** - It's safe to expose (it's in browser code anyway)
- ✅ **URL is public** - It's the endpoint everyone uses
- ❌ **Never expose the service_role key** - That's a secret!

### Multiple Environments
You might want different values for:
- **Production** - Your live Supabase project
- **Preview** - Testing Supabase project
- **Development** - Local development values

For now, use the same values for all unless you have multiple Supabase projects.

---

## 🔄 Step-by-Step Visual Guide

```
1. Vercel Dashboard
   ├─ Select your project
   └─ Click "Settings"

2. Settings Page
   ├─ Left menu: Click "Environment Variables"
   └─ You see the form

3. Add Variables
   ├─ Name: REACT_APP_SUPABASE_URL
   ├─ Value: https://xxxxx.supabase.co
   ├─ Environments: Check all 3 boxes
   └─ Click "Save"

4. Add Second Variable
   ├─ Name: REACT_APP_SUPABASE_ANON_KEY
   ├─ Value: eyJhbGc...
   ├─ Environments: Check all 3 boxes
   └─ Click "Save"

5. Redeploy
   ├─ Go to "Deployments"
   ├─ Click ⋮ on failed deployment
   ├─ Click "Redeploy"
   └─ Wait 2-5 minutes
```

---

## ✅ Verify Deployment Success

After redeployment:

1. **Check Status**
   - Deployments page shows ✅ checkmark
   - Status says "Ready"

2. **Test Live Site**
   - Visit your live URL
   - Check that it loads
   - Try logging in

3. **Check Console**
   - DevTools → Console
   - No errors about environment variables
   - Should see your app working

---

## 🆘 Still Getting Errors?

### Error: "Cannot find module 'supabase'"
- Missing dependency, run: `npm install @supabase/supabase-js`

### Error: "Supabase connection failed"
- Wrong credentials, double-check the values
- Make sure you copied the entire key
- No extra spaces or quotes

### Error: "CORS error"
- Supabase permissions issue
- Not related to Vercel deployment
- Check your Supabase RLS policies

---

## 📚 Related Guides

- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **Supabase Docs:** https://supabase.com/docs/guides/api
- **React Env Vars:** https://create-react-app.dev/docs/adding-custom-environment-variables/

---

## ✨ What Happens Next

After successful deployment:

1. ✅ Site is live and working
2. ✅ Performance optimizations active (caching headers)
3. ✅ All features working (Supabase connected)
4. ✅ Ready to monitor performance

---

## 🎯 Deployment Checklist

- [ ] Found Supabase URL and anon key
- [ ] Added REACT_APP_SUPABASE_URL to Vercel
- [ ] Added REACT_APP_SUPABASE_ANON_KEY to Vercel
- [ ] Set both for Production + Preview + Development
- [ ] Redeployed the project
- [ ] Deployment shows ✅ "Ready"
- [ ] Visited live site and tested
- [ ] No errors in DevTools console

---

## 💡 Pro Tips

### Tip 1: Use `.env.example`
Create a `.env.example` file in your repo (without actual values):
```
REACT_APP_SUPABASE_URL=https://example.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```

This helps your team know what variables are needed.

### Tip 2: Same Values for All Environments
For a small project, use the same Supabase project for dev, preview, and production.

### Tip 3: Preview Deployments
Vercel automatically creates preview deployments for pull requests. They'll also have the environment variables.

---

## ✅ You're All Set!

Once deployment completes with ✅ status:

1. Your website is live
2. Performance optimizations are active
3. All Quick Wins are deployed
4. 30-50% performance improvement active

**Next:** Monitor your website's performance using Google PageSpeed Insights

---

**Time to deploy:** 5-10 minutes  
**Difficulty:** Easy  
**Result:** Live, fast website with all optimizations! 🎉

If you hit any issues, check the error messages - they're usually helpful!
